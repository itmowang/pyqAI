export interface ThemeConfig {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
  cssVariables: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateThemeRequest {
  cssVariables?: Record<string, string>;
  isActive?: boolean;
}

export type ThemeName = 'moments' | 'minimal';
