---
name: e2e-testing
description: End-to-end testing automation using agent-browser for feature accuracy validation. Use when the user needs to test web application features, validate user interactions, verify data flows, test authentication, check form submissions, validate navigation, test responsive design, or perform comprehensive feature testing across the entire application stack.
allowed-tools: Bash(npx agent-browser:*), Bash(agent-browser:*)
---

# End-to-End Testing with agent-browser

## Core Testing Philosophy

End-to-end testing validates complete user workflows from browser interaction to backend data persistence. Every test should simulate real user behavior and verify both UI feedback and data accuracy.

**Key Principles:**

- Test user journeys, not individual components
- Validate data persistence across sessions
- Verify error handling and edge cases
- Ensure accessibility and usability
- Test across different viewport sizes
- Validate form submissions and API responses

## Essential Testing Workflow

```bash
# 1. Setup test environment
agent-browser --session test-session open ${BASE_URL}
agent-browser wait --load networkidle

# 2. Take baseline snapshot
agent-browser snapshot -i > baseline.txt

# 3. Execute test steps
agent-browser fill @e1 "test-data"
agent-browser click @e2

# 4. Validate changes
agent-browser wait --load networkidle
agent-browser diff snapshot  # Compare against baseline

# 5. Capture evidence
agent-browser screenshot test-result.png
agent-browser get text @e3 > actual-output.txt

# 6. Cleanup
agent-browser close
```

## Feature Testing Patterns

### 1. Form Submission Testing

```bash
# Complete form testing workflow
test_form_submission() {
    local form_url="$1"
    local test_data="$2"

    # Navigate and wait for form
    agent-browser open "$form_url"
    agent-browser wait --load networkidle
    agent-browser snapshot -i

    # Fill form fields
    agent-browser fill @e1 "$test_data"
    agent-browser select @e2 "option-value"
    agent-browser check @e3  # checkbox

    # Take pre-submit snapshot
    agent-browser screenshot before-submit.png

    # Submit and verify
    agent-browser click @e4  # submit button
    agent-browser wait --url "*/success*" || agent-browser wait --load networkidle

    # Validate success indicators
    agent-browser snapshot -i
    local success_message=$(agent-browser get text ".success-message" 2>/dev/null)

    if [[ "$success_message" == *"success"* ]]; then
        echo "✅ Form submission successful"
        agent-browser screenshot success.png
        return 0
    else
        echo "❌ Form submission failed"
        agent-browser screenshot error.png
        return 1
    fi
}
```

### 2. Authentication Flow Testing

```bash
# Test complete login/logout cycle
test_authentication() {
    local login_url="$1"
    local username="$2"
    local password="$3"

    # Test login
    agent-browser open "$login_url"
    agent-browser wait --load networkidle
    agent-browser snapshot -i

    # Enter credentials
    agent-browser fill @e1 "$username"
    agent-browser fill @e2 "$password"
    agent-browser click @e3  # login button

    # Wait for redirect/dashboard
    agent-browser wait --url "*/dashboard*" --timeout 10000 || {
        echo "❌ Login failed - no redirect"
        agent-browser screenshot login-failed.png
        return 1
    }

    # Verify logged-in state
    agent-browser snapshot -i
    local user_indicator=$(agent-browser get text ".user-profile" 2>/dev/null)

    if [[ -n "$user_indicator" ]]; then
        echo "✅ Login successful"

        # Test logout
        agent-browser click ".logout-button"
        agent-browser wait --url "*/login*" --timeout 5000

        # Verify logged-out state
        local login_form=$(agent-browser get text "input[type='password']" 2>/dev/null)
        if [[ -n "$login_form" ]]; then
            echo "✅ Logout successful"
            return 0
        else
            echo "❌ Logout failed"
            return 1
        fi
    else
        echo "❌ Login failed - not authenticated"
        return 1
    fi
}
```

### 3. Data Persistence Testing

```bash
# Test data CRUD operations
test_data_persistence() {
    local base_url="$1"
    local test_item="$2"

    # CREATE: Add new item
    agent-browser open "$base_url/create"
    agent-browser wait --load networkidle
    agent-browser snapshot -i

    agent-browser fill @e1 "$test_item"
    agent-browser click @e2  # save button
    agent-browser wait --load networkidle

    # Get item ID from URL or page
    local item_id=$(agent-browser get url | sed 's/.*\///')

    # READ: Verify item exists
    agent-browser open "$base_url/list"
    agent-browser wait --load networkidle
    agent-browser snapshot -i

    local item_found=$(agent-browser get text body | grep -c "$test_item")
    if [[ $item_found -eq 0 ]]; then
        echo "❌ Item not found in list"
        return 1
    fi

    # UPDATE: Modify item
    agent-browser open "$base_url/edit/$item_id"
    agent-browser wait --load networkidle
    agent-browser fill @e1 "${test_item}_updated"
    agent-browser click @e2  # save button
    agent-browser wait --load networkidle

    # Verify update
    agent-browser open "$base_url/list"
    agent-browser wait --load networkidle
    local updated_found=$(agent-browser get text body | grep -c "${test_item}_updated")
    if [[ $updated_found -eq 0 ]]; then
        echo "❌ Item update failed"
        return 1
    fi

    # DELETE: Remove item
    agent-browser open "$base_url/list"
    agent-browser wait --load networkidle
    agent-browser click ".delete-button[data-id='$item_id']"
    agent-browser wait --load networkidle

    # Verify deletion
    local deleted_check=$(agent-browser get text body | grep -c "$test_item")
    if [[ $deleted_check -eq 0 ]]; then
        echo "✅ CRUD operations completed successfully"
        return 0
    else
        echo "❌ Item deletion failed"
        return 1
    fi
}
```

### 4. Navigation and Routing Testing

```bash
# Test navigation flows and routing
test_navigation() {
    local base_url="$1"

    # Test main navigation
    agent-browser open "$base_url"
    agent-browser wait --load networkidle
    agent-browser snapshot -i

    # Map all navigation links
    local nav_links=($(agent-browser eval --stdin <<'EVALEOF'
Array.from(document.querySelectorAll('nav a, .nav-menu a'))
  .map(a => a.href)
  .filter(href => href.startsWith(window.location.origin))
  .join('\n')
EVALEOF
))

    # Test each navigation link
    for link in "${nav_links[@]}"; do
        echo "Testing navigation to: $link"

        agent-browser open "$link"
        agent-browser wait --load networkidle

        # Verify page loaded correctly
        local current_url=$(agent-browser get url)
        local page_title=$(agent-browser get title)

        if [[ "$current_url" == "$link" ]] && [[ -n "$page_title" ]]; then
            echo "✅ Navigation to $link successful"
        else
            echo "❌ Navigation to $link failed"
            agent-browser screenshot "nav-error-$(basename $link).png"
        fi

        # Test back navigation
        agent-browser eval "history.back()"
        agent-browser wait --load networkidle
    done

    echo "✅ Navigation testing completed"
}
```

### 5. Responsive Design Testing

```bash
# Test feature across different viewport sizes
test_responsive_design() {
    local url="$1"
    local viewports=("1920x1080" "1024x768" "768x1024" "375x667")

    for viewport in "${viewports[@]}"; do
        local width=$(echo $viewport | cut -d'x' -f1)
        local height=$(echo $viewport | cut -d'x' -f2)

        echo "Testing viewport: $viewport"

        # Set viewport
        agent-browser eval "window.resizeTo($width, $height)"
        agent-browser open "$url"
        agent-browser wait --load networkidle

        # Take screenshot
        agent-browser screenshot "responsive-${viewport}.png"

        # Test core functionality
        agent-browser snapshot -i

        # Verify mobile menu appears on small screens
        if [[ $width -lt 768 ]]; then
            local mobile_menu=$(agent-browser get text ".mobile-menu" 2>/dev/null)
            if [[ -n "$mobile_menu" ]]; then
                echo "✅ Mobile menu present on $viewport"
            else
                echo "⚠️  Mobile menu missing on $viewport"
            fi
        fi

        # Check for horizontal scroll (bad on mobile)
        local scroll_width=$(agent-browser eval "document.documentElement.scrollWidth")
        local client_width=$(agent-browser eval "document.documentElement.clientWidth")

        if [[ $scroll_width -gt $client_width ]]; then
            echo "⚠️  Horizontal scroll detected on $viewport"
        fi
    done
}
```

## Error Handling and Edge Case Testing

### 1. Form Validation Testing

```bash
# Test form validation edge cases
test_form_validation() {
    local form_url="$1"

    agent-browser open "$form_url"
    agent-browser wait --load networkidle
    agent-browser snapshot -i

    # Test required field validation
    echo "Testing required field validation..."
    agent-browser click ".submit-button"
    agent-browser wait 1000

    local error_message=$(agent-browser get text ".error-message" 2>/dev/null)
    if [[ -n "$error_message" ]]; then
        echo "✅ Required field validation working"
    else
        echo "❌ Required field validation missing"
    fi

    # Test invalid email format
    echo "Testing email validation..."
    agent-browser fill "input[type='email']" "invalid-email"
    agent-browser click ".submit-button"
    agent-browser wait 1000

    local email_error=$(agent-browser get text ".email-error" 2>/dev/null)
    if [[ -n "$email_error" ]]; then
        echo "✅ Email validation working"
    else
        echo "❌ Email validation missing"
    fi

    # Test password strength
    echo "Testing password validation..."
    agent-browser fill "input[type='password']" "123"
    agent-browser click ".submit-button"
    agent-browser wait 1000

    local password_error=$(agent-browser get text ".password-error" 2>/dev/null)
    if [[ -n "$password_error" ]]; then
        echo "✅ Password validation working"
    else
        echo "❌ Password validation missing"
    fi
}
```

### 2. Network Error Simulation

```bash
# Test offline/network error handling
test_network_errors() {
    local url="$1"

    # Simulate slow network
    agent-browser eval --stdin <<'EVALEOF'
// Simulate slow network responses
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  await new Promise(resolve => setTimeout(resolve, 3000));
  return originalFetch.apply(this, args);
};
EVALEOF

    agent-browser open "$url"
    agent-browser wait --load networkidle --timeout 10000

    # Test if loading states are shown
    local loading_indicator=$(agent-browser get text ".loading" 2>/dev/null)
    if [[ -n "$loading_indicator" ]]; then
        echo "✅ Loading states displayed during slow network"
    else
        echo "⚠️  No loading indicator shown during slow network"
    fi

    # Simulate network failure
    agent-browser eval --stdin <<'EVALEOF'
// Simulate network failure
window.fetch = () => Promise.reject(new Error('Network Error'));
EVALEOF

    # Try to submit a form or make a request
    agent-browser click ".submit-button"
    agent-browser wait 2000

    local error_message=$(agent-browser get text ".network-error" 2>/dev/null)
    if [[ -n "$error_message" ]]; then
        echo "✅ Network error handling working"
    else
        echo "❌ Network error handling missing"
    fi
}
```

## Performance Testing

### 1. Page Load Performance

```bash
# Test page performance metrics
test_performance() {
    local url="$1"

    # Start profiling
    agent-browser profiler start

    agent-browser open "$url"
    agent-browser wait --load networkidle

    # Stop profiling and get metrics
    agent-browser profiler stop performance-trace.json

    # Get performance metrics
    local metrics=$(agent-browser eval --stdin <<'EVALEOF'
JSON.stringify({
  loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
  domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
  firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime,
  firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime,
  resourceCount: performance.getEntriesByType('resource').length
})
EVALEOF
)

    echo "Performance Metrics: $metrics"

    # Check for performance thresholds
    local load_time=$(echo $metrics | jq -r '.loadTime')
    if [[ $load_time -lt 3000 ]]; then
        echo "✅ Page load time under 3 seconds"
    else
        echo "⚠️  Page load time over 3 seconds: ${load_time}ms"
    fi
}
```

### 2. Accessibility Testing

```bash
# Basic accessibility testing
test_accessibility() {
    local url="$1"

    agent-browser open "$url"
    agent-browser wait --load networkidle

    # Check for alt text on images
    local images_without_alt=$(agent-browser eval --stdin <<'EVALEOF'
Array.from(document.querySelectorAll('img:not([alt])'))
  .length
EVALEOF
)

    if [[ $images_without_alt -eq 0 ]]; then
        echo "✅ All images have alt text"
    else
        echo "⚠️  $images_without_alt images missing alt text"
    fi

    # Check for form labels
    local inputs_without_labels=$(agent-browser eval --stdin <<'EVALEOF'
Array.from(document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])'))
  .filter(input => !document.querySelector(`label[for="${input.id}"]`))
  .length
EVALEOF
)

    if [[ $inputs_without_labels -eq 0 ]]; then
        echo "✅ All form inputs have labels"
    else
        echo "⚠️  $inputs_without_labels form inputs missing labels"
    fi

    # Test keyboard navigation
    echo "Testing keyboard navigation..."
    agent-browser press Tab
    agent-browser wait 500

    local focused_element=$(agent-browser eval "document.activeElement.tagName")
    if [[ "$focused_element" != "BODY" ]]; then
        echo "✅ Keyboard navigation working"
    else
        echo "⚠️  Keyboard navigation issues detected"
    fi
}
```

## Multi-User and Session Testing

```bash
# Test multi-user scenarios
test_multi_user() {
    local base_url="$1"

    # User 1 session
    agent-browser --session user1 open "$base_url"
    agent-browser --session user1 wait --load networkidle

    # User 2 session
    agent-browser --session user2 open "$base_url"
    agent-browser --session user2 wait --load networkidle

    # Simulate concurrent actions
    agent-browser --session user1 fill "@e1" "user1_data" &
    agent-browser --session user2 fill "@e1" "user2_data" &
    wait

    agent-browser --session user1 click "@e2" &
    agent-browser --session user2 click "@e2" &
    wait

    # Verify data integrity
    agent-browser --session user1 get text ".result"
    agent-browser --session user2 get text ".result"

    # Cleanup
    agent-browser --session user1 close
    agent-browser --session user2 close
}
```

## Test Suite Execution Framework

```bash
# Complete test suite runner
run_e2e_tests() {
    local base_url="$1"
    local test_suite="$2"

    # Initialize test environment
    export AGENT_BROWSER_CONTENT_BOUNDARIES=1
    export AGENT_BROWSER_MAX_OUTPUT=100000

    # Test results tracking
    local test_results=()
    local test_count=0
    local pass_count=0

    # Create test session
    agent-browser --session e2e-test open "$base_url"

    echo "🚀 Starting E2E Test Suite: $test_suite"
    echo "Base URL: $base_url"
    echo "Timestamp: $(date)"
    echo "=================================="

    # Run test categories based on suite
    case "$test_suite" in
        "auth")
            run_test "Authentication Flow" test_authentication "$base_url/login" "test@example.com" "password123"
            ;;
        "forms")
            run_test "Form Validation" test_form_validation "$base_url/contact"
            run_test "Form Submission" test_form_submission "$base_url/signup" "test-data"
            ;;
        "navigation")
            run_test "Navigation Flow" test_navigation "$base_url"
            run_test "Responsive Design" test_responsive_design "$base_url"
            ;;
        "performance")
            run_test "Page Performance" test_performance "$base_url"
            run_test "Accessibility" test_accessibility "$base_url"
            ;;
        "full")
            # Run all tests
            run_test "Authentication" test_authentication "$base_url/login" "test@example.com" "password123"
            run_test "Form Validation" test_form_validation "$base_url/contact"
            run_test "Navigation" test_navigation "$base_url"
            run_test "Performance" test_performance "$base_url"
            run_test "Accessibility" test_accessibility "$base_url"
            ;;
    esac

    # Cleanup
    agent-browser --session e2e-test close

    # Generate test report
    echo "=================================="
    echo "🏁 Test Suite Complete"
    echo "Tests Run: $test_count"
    echo "Passed: $pass_count"
    echo "Failed: $((test_count - pass_count))"
    echo "Success Rate: $(( (pass_count * 100) / test_count ))%"

    # Return success if all tests passed
    [[ $pass_count -eq $test_count ]]
}

# Helper function to run individual tests
run_test() {
    local test_name="$1"
    shift
    local test_function="$1"
    shift

    echo ""
    echo "🧪 Running: $test_name"
    echo "---"

    ((test_count++))

    if $test_function "$@"; then
        echo "✅ PASS: $test_name"
        ((pass_count++))
        test_results+=("✅ $test_name")
    else
        echo "❌ FAIL: $test_name"
        test_results+=("❌ $test_name")
    fi
}
```

## Quick Test Templates

### Feature Smoke Test

```bash
# Quick smoke test for new features
smoke_test_feature() {
    local feature_url="$1"

    agent-browser open "$feature_url" && agent-browser wait --load networkidle && agent-browser snapshot -i

    # Basic interaction test
    agent-browser click "@e1" && agent-browser wait 1000

    # Verify no JavaScript errors
    local js_errors=$(agent-browser eval "window.console.errors?.length || 0")

    if [[ $js_errors -eq 0 ]]; then
        echo "✅ Feature smoke test passed"
        return 0
    else
        echo "❌ Feature smoke test failed - $js_errors JavaScript errors"
        return 1
    fi
}
```

### Regression Test

```bash
# Compare current behavior against baseline
regression_test() {
    local url="$1"
    local baseline_screenshot="$2"

    agent-browser open "$url"
    agent-browser wait --load networkidle
    agent-browser screenshot current.png

    # Visual regression test
    agent-browser diff screenshot --baseline "$baseline_screenshot"

    local diff_percentage=$(agent-browser diff screenshot --baseline "$baseline_screenshot" | grep -o '[0-9.]*%')

    # Allow up to 5% difference for acceptable changes
    if [[ $(echo "$diff_percentage" | tr -d '%') < 5 ]]; then
        echo "✅ Regression test passed - $diff_percentage difference"
        return 0
    else
        echo "❌ Regression test failed - $diff_percentage difference"
        return 1
    fi
}
```

## Best Practices for E2E Testing

### 1. Test Data Management

- Use predictable test data that can be easily cleaned up
- Create dedicated test accounts/users
- Use database seeding for consistent starting states
- Clean up test data between runs

### 2. Test Isolation

- Each test should be independent
- Use separate browser sessions for concurrent tests
- Reset application state between tests
- Use unique identifiers for test data

### 3. Wait Strategies

- Always wait for network idle after navigation
- Use explicit waits for dynamic content
- Wait for specific elements rather than fixed timeouts
- Handle loading states and animations

### 4. Error Recovery

- Take screenshots on test failures
- Capture browser console errors
- Log detailed error information
- Implement retry mechanisms for flaky tests

### 5. Reporting

- Generate detailed test reports with screenshots
- Track test execution time
- Log performance metrics
- Maintain test result history

## Usage Examples

```bash
# Run authentication tests
run_e2e_tests "https://myapp.com" "auth"

# Test specific feature
smoke_test_feature "https://myapp.com/new-feature"

# Run regression test
regression_test "https://myapp.com/dashboard" "baseline-dashboard.png"

# Test form validation
test_form_validation "https://myapp.com/signup"

# Test across different viewports
test_responsive_design "https://myapp.com"
```

This skill provides a comprehensive framework for testing feature accuracy through end-to-end browser automation, ensuring your application works correctly from the user's perspective.
