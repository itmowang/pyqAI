export interface Post {
  id: string;
  title: string;
  content: string;
  images?: string[];
  authorId: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  images?: string[];
  tagIds?: string[];
  published?: boolean;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  images?: string[];
  tagIds?: string[];
  published?: boolean;
}
