interface ResponserProps {
  message: string;
}

export default function Responser({ message }: ResponserProps) {
  return (
    <div className="flex justify-start mb-3">
      <div className="max-w-[75%] px-4 py-2 rounded-2xl rounded-bl-sm bg-ivory border border-gold/30 text-warmGray shadow-md font-nunito">
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
