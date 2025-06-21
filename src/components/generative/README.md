# File Upload Dialog Component

A comprehensive, accessible, and user-friendly file upload dialog component built with React, TypeScript, and Tailwind CSS.

## Features

- ✅ Drag and drop file upload
- ✅ Click to browse files
- ✅ File type validation (PDF, TXT, DOC, DOCX)
- ✅ File size validation (up to 50MB)
- ✅ Multiple file selection
- ✅ Visual file preview with icons
- ✅ Error handling and user feedback
- ✅ Accessible design
- ✅ Responsive layout
- ✅ TypeScript support
- ✅ Customizable appearance

## Installation

The component uses the following dependencies:

- `@radix-ui/react-dialog` - For the modal dialog
- `lucide-react` - For icons
- `class-variance-authority` - For styling variants
- `clsx` - For conditional classes

Make sure these are installed in your project:

```bash
npm install @radix-ui/react-dialog lucide-react class-variance-authority clsx
```

## Usage

### Basic Usage

```tsx
import { useState } from 'react';
import { DialogImportFileGenerative } from '@/components/generative/DialogImportFileGenerative';
import { Button } from '@/components/ui/button';

export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilesSelected = (files: File[]) => {
    console.log('Selected files:', files);
    // Process your files here
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Upload Files</Button>

      <DialogImportFileGenerative
        open={isOpen}
        onOpenChange={setIsOpen}
        onFilesSelected={handleFilesSelected}
      />
    </>
  );
}
```

### Advanced Usage

```tsx
<DialogImportFileGenerative
  open={isOpen}
  onOpenChange={setIsOpen}
  onFilesSelected={handleFilesSelected}
  title="Import Documents"
  description="Upload your documents to process them. We support PDF, TXT, DOC, and DOCX files."
  maxFiles={5}
  allowMultiple={true}
/>
```

## Props

| Prop              | Type                      | Default                       | Description                                    |
| ----------------- | ------------------------- | ----------------------------- | ---------------------------------------------- |
| `open`            | `boolean`                 | -                             | Controls the open state of the dialog          |
| `onOpenChange`    | `(open: boolean) => void` | -                             | Callback when dialog open state changes        |
| `onFilesSelected` | `(files: File[]) => void` | -                             | Callback when files are selected and validated |
| `title`           | `string`                  | `"Upload Files"`              | Dialog title                                   |
| `description`     | `string`                  | `"Select files to upload..."` | Dialog description                             |
| `maxFiles`        | `number`                  | `5`                           | Maximum number of files allowed                |
| `allowMultiple`   | `boolean`                 | `true`                        | Whether multiple files can be selected         |

## File Validation

The component validates files based on:

- **File Types**: Only PDF, TXT, DOC, and DOCX files are allowed
- **File Size**: Maximum 50MB per file
- **MIME Types**: Validates actual file content, not just extensions

### Supported File Types

| Extension | MIME Type                                                                 |
| --------- | ------------------------------------------------------------------------- |
| `.pdf`    | `application/pdf`                                                         |
| `.txt`    | `text/plain`                                                              |
| `.doc`    | `application/msword`                                                      |
| `.docx`   | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |

## Customization

### Styling

The component uses Tailwind CSS classes and can be customized by:

1. Modifying the component's CSS classes
2. Using CSS custom properties for theming
3. Overriding specific styles with your own CSS

### Validation Rules

To modify validation rules, update the constants at the top of the component:

```tsx
const MAX_FILE_SIZE_MB = 50; // Change max file size
const ALLOWED_FILE_TYPES = ['.pdf', '.txt', '.doc', '.docx']; // Add/remove file types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]; // Update MIME types accordingly
```

## Accessibility

The component follows accessibility best practices:

- Keyboard navigation support
- Screen reader friendly
- ARIA labels and descriptions
- Focus management
- Color contrast compliance

## Browser Support

The component works in all modern browsers that support:

- File API
- Drag and Drop API
- ES6+ features

## Examples

### Single File Upload

```tsx
<DialogImportFileGenerative
  open={isOpen}
  onOpenChange={setIsOpen}
  onFilesSelected={handleFilesSelected}
  allowMultiple={false}
  maxFiles={1}
  title="Upload Document"
  description="Select a single document to upload."
/>
```

### Custom File Processing

```tsx
const handleFilesSelected = async (files: File[]) => {
  for (const file of files) {
    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to your API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log(`${file.name} uploaded successfully`);
      } else {
        console.error(`Failed to upload ${file.name}`);
      }
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
    }
  }
};
```

## Error Handling

The component handles various error scenarios:

- Invalid file types
- Files too large
- Too many files selected
- Network errors (when implementing upload)

All errors are displayed with user-friendly messages and toast notifications.

## Dependencies

This component relies on:

- React 18+
- TypeScript 4.5+
- Tailwind CSS 3.0+
- Radix UI Dialog
- Lucide React icons

## Contributing

To contribute to this component:

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure accessibility compliance

## License

This component is part of the Dozu UI Service project.
