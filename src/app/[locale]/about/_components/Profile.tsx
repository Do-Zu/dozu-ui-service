'use client';

import React from 'react';
import {useTranslations} from 'next-intl';  // Hook giúp sử dụng i18n trong component

interface ProfileProps {
  name: string;
  age: number;
  bio: string;
}

const Profile: React.FC<ProfileProps> = ({ name, age, bio }) => {
  const t = useTranslations('profile');  // Lấy các chuỗi dịch từ next-intl

  return (
    <div className="profile">
      <h2>{t('name')}: {name}</h2>
      <p>{t('age')}: {age}</p>
      <p>{t('bio')}: {bio}</p>
    </div>
  );
};

export default Profile;
