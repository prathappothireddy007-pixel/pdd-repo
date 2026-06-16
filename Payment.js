import { useState } from "react";

/* IMPORT QR IMAGE */

import jioqr from "../assets/jioqr.jpg";

function Payment() {

  const [method, setMethod] =
    useState("upi");

  const [showOtp, setShowOtp] =
    useState(false);

  const [otp, setOtp] =
    useState("");

  /* SEND OTP */

  const handlePayment = () => {

    alert(
      "OTP Sent Successfully"
    );

    setShowOtp(true);
  };

  /* VERIFY OTP */

  const verifyOtp = () => {

    if (otp === "1234") {

      alert(
        "Payment Successful\n\nAmount Sent Successfully"
      );

    } else {

      alert("Invalid OTP");
    }
  };

  return (

    <div className="payment-container">

      <div className="payment-box">

        <h1>Payment Gateway</h1>

        {/* PAYMENT METHODS */}

        <div className="payment-methods">

          <button
            onClick={() =>
              setMethod("upi")
            }
          >
            UPI
          </button>

          <button
            onClick={() =>
              setMethod("card")
            }
          >
            Card
          </button>

          <button
            onClick={() =>
              setMethod(
                "netbanking"
              )
            }
          >
            Net Banking
          </button>

        </div>

        {/* ================= UPI ================= */}

        {method === "upi" && (

          <div className="payment-section">

            <h2>
              Scan QR To Pay
            </h2>

            {/* QR IMAGE */}

            <img
              src={jioqr}
              alt="UPI QR"
              className="qr-image"
            />

            <p>
              UPI ID :
              9032223582@jio
            </p>

            <input
              type="text"
              placeholder="Enter Your UPI ID"
            />

            <button
              onClick={handlePayment}
            >
              Pay Using UPI
            </button>

            {/* OTP */}

            {showOtp && (

              <div>

                <input
                  type="text"
                  placeholder="Enter OTP"
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                    )
                  }
                />

                <button
                  onClick={verifyOtp}
                >
                  Verify OTP
                </button>

              </div>

            )}

          </div>

        )}

        {/* ================= CARD ================= */}

        {method === "card" && (

          <div className="payment-section">

            <h2>
              Debit / Credit Card
            </h2>

            <p>
              Account Number :
              41667623502
            </p>

            <p>
              IFSC :
              SBIN0020677
            </p>

            <input
              type="text"
              placeholder="Card Holder Name"
            />

            <input
              type="text"
              placeholder="Card Number"
            />

            <div className="card-row">

              <input
                type="text"
                placeholder="MM/YY"
              />

              <input
                type="password"
                placeholder="CVV"
              />

            </div>

            <button
              onClick={handlePayment}
            >
              Pay Now
            </button>

            {/* OTP */}

            {showOtp && (

              <div>

                <input
                  type="text"
                  placeholder="Enter OTP"
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                    )
                  }
                />

                <button
                  onClick={verifyOtp}
                >
                  Verify OTP
                </button>

              </div>

            )}

          </div>

        )}

        {/* ================= NET BANKING ================= */}

        {method ===
          "netbanking" && (

          <div className="payment-section">

            <h2>
              Net Banking
            </h2>

            <p>
              Account Number :
              41667623502
            </p>

            <p>
              IFSC Code :
              SBIN0020677
            </p>

            <select>

              <option>
                Select Bank
              </option>

              <option>
                SBI
              </option>

              <option>
                HDFC
              </option>

              <option>
                ICICI
              </option>

              <option>
                Axis Bank
              </option>

            </select>

            <input
              type="text"
              placeholder="User ID"
            />

            <input
              type="password"
              placeholder="Password"
            />

            <button
              onClick={handlePayment}
            >
              Login & Pay
            </button>

            {/* OTP */}

            {showOtp && (

              <div>

                <input
                  type="text"
                  placeholder="Enter OTP"
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                    )
                  }
                />

                <button
                  onClick={verifyOtp}
                >
                  Verify OTP
                </button>

              </div>

            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default Payment;