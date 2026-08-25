export default function Loading() {
  return (
    <main className="w-full py-[58px] px-[68px] animate-pulse">
      <div className="h-7 w-64 rounded-[8px] bg-[#f2eeee]" />
      <div className="mt-2 h-4 w-96 rounded-[8px] bg-[#f7f4f4]" />
      <div className="mt-8 h-[132px] rounded-[20px] bg-[#f7f4f4]" />
      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[80px] rounded-[12px] bg-[#f7f4f4]" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 h-[300px] rounded-[20px] bg-[#f7f4f4]" />
        <div className="h-[300px] rounded-[20px] bg-[#f7f4f4]" />
      </div>
    </main>
  );
}
