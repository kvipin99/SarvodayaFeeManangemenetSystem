import { User } from '../types';

export const generateDefaultUsers = (): User[] => {
  const users: User[] = [];
  
  // Add admin user
  users.push({
    id: 'admin',
    username: 'admin',
    password: hashPasswordSync('admin'),
    role: 'admin',
    createdAt: new Date(),
  });

  // Add class teachers (class1a to class12e)
  for (let classNum = 1; classNum <= 12; classNum++) {
    for (let div = 0; div < 5; div++) {
      const division = String.fromCharCode(65 + div); // A, B, C, D, E
      users.push({
        id: `class${classNum}${division.toLowerCase()}`,
        username: `class${classNum}${division.toLowerCase()}`,
        password: hashPasswordSync('admin'),
        role: 'teacher',
        class: classNum,
        division,
        createdAt: new Date(),
      });
    }
  }

  return users;
};

// Simple hash function for demo purposes
export const hashPasswordSync = (password: string): string => {
  return btoa(password + 'salt');
};

export const hashPassword = async (password: string): Promise<string> => {
  return hashPasswordSync(password);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return hashPasswordSync(password) === hash;
};