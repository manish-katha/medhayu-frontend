"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext"; // your existing auth context
import { setSession } from "../utils/common/authHelper";
import { useTokenExpire } from "../contexts/TokenExpireContext";

const TokenExpire = ({ open }) => {
  const router = useRouter();
  const auth = useAuth();
  const { setIsExpired } = useTokenExpire();

  const handleLogout = () => {
    auth.logout(() => {
      localStorage.clear();
      setSession(null);
      setIsExpired(false); // hide popup
      router.push("/login"); // ✅ use Next.js router
    });
  };

  if (!open) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1040,
        }}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{
          zIndex: 1050,
          display: "block",
        }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title w-100 text-center">
                <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                Session Expired
              </h5>
            </div>

            <div className="modal-body text-center py-4">
              <p className="text-muted mb-4">
                Your token has expired. Please log in again to continue.
              </p>

              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={handleLogout}
                style={{
                  minWidth: "100px",
                }}
              >
                <i className="fas fa-sign-in-alt me-2"></i>
                Login Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TokenExpire;
