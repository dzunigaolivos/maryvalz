interface SenderProps {
  message: string;
}

export default function Sender({ message }: SenderProps) {
  return (
    <div className="flex justify-end mb-3">
      <div className="max-w-[75%] px-4 py-2 rounded-2xl rounded-br-sm bg-burgundy text-cream shadow-md font-nunito">
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
