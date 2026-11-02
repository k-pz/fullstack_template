import { Card, CardContent } from "@/components/ui/card";
import "./index.css";

export function App() {
  return (
    <main className="container mx-auto max-w-xl p-8">
      <h1 className="mb-6 text-center text-3xl font-bold">App</h1>
      <Card>
        <CardContent>
          Edit <code>src/App.tsx</code>. API calls to <code>/api/*</code> are forwarded to Django.
        </CardContent>
      </Card>
    </main>
  );
}

export default App;
