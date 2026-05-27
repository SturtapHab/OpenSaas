import { CreateLandingForm } from "@/components/landings/CreateLandingForm";

export default function NewLandingPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[#171717]">
          Создать лендинг
        </h1>
        <p className="text-sm text-[#8e8e93] mt-0.5">
          Заполните форму — AI сгенерирует профессиональный лендинг за ~30 секунд
        </p>
      </div>

      <div
        className="bg-white rounded-2xl border border-black/[0.06] p-6"
        style={{
          boxShadow:
            "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <CreateLandingForm />
      </div>
    </div>
  );
}
