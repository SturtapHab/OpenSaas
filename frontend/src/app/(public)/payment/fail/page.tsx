import Link from "next/link";
import { PaymentPage } from "@/components/course/PaymentPage";

export default function PaymentFailPage() {
  return (
    <PaymentPage>
      <h1 className="lx-display text-[28px] leading-tight">Оплата не прошла</h1>
      <p className="mt-4 text-[var(--lx-ink-2)]">
        Деньги не списаны. Попробуйте ещё раз или выберите другой способ оплаты.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/#course" className="lx-btn lx-btn-ink">Купить курс снова</Link>
        <Link href="/billing" className="lx-btn lx-btn-ghost">В личный кабинет</Link>
      </div>
    </PaymentPage>
  );
}
