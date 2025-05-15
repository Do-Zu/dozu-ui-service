'use client';

import { getRequest } from '@/api/api';
import Axios from '@/api/axios';
import { updateAccessToken } from '@/stores/features/auth/authSlice';
import { useAppDispatch } from '@/stores/hooks';
import { useEffect } from 'react';

export default function TestingBackendPage() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(
      updateAccessToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJJZCI6NzEsInVzZXJuYW1lIjoiZHV5IiwiZW1haWwiOiJkdXlxdWFuZ3RyaTIwMDRAZ21haWwuY29tIiwicGFzc3dvcmRIYXNoIjoiMDA2OTY1YzZjMjBkOWRjYjlmMDU5ZGFiNzdjM2U4OGM6YWU5MDFiN2E0OTMxOWNlMzYwZGNiMTc2OTM0NTM2YWZiMjEzMTE4OWZiZWQ0NjVjNTkxYzkwMjFlMTZhZDY5ZmEwN2Q5ZmE0Zjc3NTIzZTcwY2ZjY2U4ZGIxYmJmN2Q0YzRkY2UwN2I4NmM5YTlmZjc4YjQ5MzExY2Q3MDM0NTciLCJmdWxsTmFtZSI6bnVsbCwiYXZhdGFyVXJsIjoiaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vZHN2bGxiMWFtL2ltYWdlL3VwbG9hZC9mX2F1dG8scV9hdXRvL3YxL2RlZmF1bHQvdGNkNm5ubTZsZ24wamIzcHV0b24iLCJyb2xlIjoidXNlciIsImNyZWF0ZWRBdCI6IjIwMjUtMDUtMDdUMDg6MjQ6MDIuNDYyWiIsInVwZGF0ZWRBdCI6bnVsbCwicHJlZmVyZW5jZXMiOm51bGwsImZyZWVUaW1lIjpudWxsLCJidXN5VGltZSI6bnVsbCwiaG9iYmllc1RvcGljIjpudWxsLCJhdmdTdHVkeUR1cmF0aW9uIjpudWxsLCJpc0FjdGl2ZSI6dHJ1ZSwiaXNWZXJpZmllZCI6ZmFsc2V9LCJpYXQiOjE3NDY2MTA0NjgsImV4cCI6MTc0NjY5Njg2OH0.w4z1eUhV9tL75ofH10BiTR4GghaHE3nEATY5wBopPlc',
      ),
    );
  }, []);

  const handleProfile = async () => {
    const result = await Axios.get('/auth/profile');
    console.log(result);
  };

  return (
    <div>
      <h1>Testing Backend</h1>
      <button onClick={handleProfile}>Get profile</button>
    </div>
  );
}
