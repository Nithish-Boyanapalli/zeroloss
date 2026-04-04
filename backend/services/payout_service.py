import os
import uuid
import httpx
from datetime import datetime
from sqlalchemy.orm import Session

from backend.models import Payout, Claim, Worker, PayoutStatusEnum

RAZORPAY_KEY    = os.getenv("RAZORPAY_KEY_ID", "rzp_test_demo")
RAZORPAY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "demo_secret")


async def initiate_payout(db: Session, claim: Claim, worker: Worker) -> Payout:
    # Simulate Razorpay payout (test mode)
    fake_order_id   = f"order_{uuid.uuid4().hex[:16]}"
    fake_payment_id = f"pay_{uuid.uuid4().hex[:16]}"
    fake_ref        = f"ZL{uuid.uuid4().hex[:10].upper()}"

    payout = Payout(
        claim_id=claim.id,
        worker_id=worker.id,
        amount=claim.claim_amount,
        upi_id=worker.upi_id or f"{worker.phone}@upi",
        razorpay_order_id=fake_order_id,
        razorpay_payment_id=fake_payment_id,
        razorpay_ref=fake_ref,
        status=PayoutStatusEnum.completed,
        paid_at=datetime.utcnow(),
    )
    db.add(payout)

    # Update claim status to paid
    claim.status = "paid"
    db.flush()

    return payout