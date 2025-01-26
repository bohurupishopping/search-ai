declare module "@/components/Header" {
  export const Header: React.FC;
}

declare module "@/components/SearchInput" {
  interface SearchInputProps {
    onSubmit: (query: string, options: any) => void;
    isLoading?: boolean;
    className?: string;
  }
  export const SearchInput: React.FC<SearchInputProps>;
}

declare module "@/components/Message" {
  interface MessageProps {
    content: string;
    type: 'user' | 'assistant';
    sources?: Array<{
      title: string;
      url: string;
      score: number;
    }>;
  }
  const Message: React.FC<MessageProps>;
  export default Message;
} 