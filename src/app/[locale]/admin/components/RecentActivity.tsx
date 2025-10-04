'use client';

export function RecentActivity() {
  const items = [
    'User JohnDoe signed up',
    'Admin updated JaneDoe\'s role',
    'User Lisa locked due to suspicious activity',
    'System rebooted successfully',
  ];

  return (
    <ul className="text-sm space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="text-muted-foreground">
          • {item}
        </li>
      ))}
    </ul>
  );
}
