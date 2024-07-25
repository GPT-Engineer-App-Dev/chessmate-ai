import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Welcome to Chess AI</h1>
        <p className="text-xl mb-6">Challenge yourself against our AI in a game of chess!</p>
        <Link to="/chess">
          <Button size="lg">
            Play Chess
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
