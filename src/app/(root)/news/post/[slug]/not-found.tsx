import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-3xl font-bold mb-4">Nie znaleziono artykułu</h2>
      <p className="text-gray-600 mb-8">
        Przepraszamy, nie mogliśmy znaleźć szukanego artykułu.
      </p>
      <Link
        href="/"
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        Wróć do strony głównej
      </Link>
    </div>
  );
}
