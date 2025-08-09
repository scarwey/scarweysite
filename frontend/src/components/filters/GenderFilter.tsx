import React, { useState, useEffect } from 'react';
import { productApi } from '../../services/api';

interface GenderFilterProps {
  selectedGender?: string;
  onGenderChange: (gender: string | undefined) => void;
  className?: string;
}

export const GenderFilter: React.FC<GenderFilterProps> = ({
  selectedGender,
  onGenderChange,
  className = "",
}) => {
  const [genders, setGenders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const genderList = await productApi.getGenders();
        setGenders(genderList);
      } catch (error) {
        console.error('Error fetching genders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenders();
  }, []);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded mb-3 w-16"></div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-20"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-medium text-gray-900 mb-3">Cinsiyet</h3>
      <div className="space-y-2">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="gender"
            checked={!selectedGender}
            onChange={() => onGenderChange(undefined)}
            className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="ml-2 text-sm text-gray-700">Tümü</span>
        </label>
        
        {genders.map((gender) => (
          <label key={gender} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="gender"
              checked={selectedGender === gender}
              onChange={() => onGenderChange(gender)}
              className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="ml-2 text-sm text-gray-700">{gender}</span>
          </label>
        ))}
      </div>
    </div>
  );
};