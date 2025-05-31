import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";
import type React from "react";
import { useEffect } from "react";

const AuthScreen: React.FC = () => {
  const { loginWithVKID, error, loading, clearError } = useAuthStore();
  const { t, language, changeLanguage, availableLanguages } = useTranslation();

  useEffect(() => {
    return () => {
      if (clearError) clearError();
    };
  }, [clearError]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#121218] vk-pattern-bg">
      <div className="w-full max-w-md animate-fade-in rounded-lg bg-[var(--color-card)] p-8 shadow-lg glass-effect">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full gradient-primary flex items-center justify-center animate-pulse-custom">
            <svg
              className="h-10 w-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.049-1.714-1.033-1.033-1.49-1.172-1.744-1.172-.356 0-.458.102-.458.593v1.566c0 .424-.136.678-1.252.678-1.846 0-3.896-1.118-5.339-3.202-2.166-3.015-2.76-5.275-2.76-5.745 0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.864 2.506 2.302 4.7 2.895 4.7.22 0 .322-.102.322-.66V9.889c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.76c.373 0 .508.203.508.66v3.54c0 .373.17.508.271.508.22 0 .407-.135.814-.542 1.27-1.422 2.183-3.608 2.183-3.608.119-.254.305-.491.745-.491h1.744c.525 0 .644.27.525.66-.22 1.015-2.354 4.03-2.354 4.03-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.048.17.491-.085.745-.576.745z" />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-var(--color-card-foreground)">
            {t("auth.title")}
          </h1>
          <p className="text-var(--color-muted-foreground)">
            {t("auth.subtitle")}
          </p>
        </div>

        <div className="mb-4 flex justify-center">
          <div className="flex bg-[var(--color-muted)] rounded-lg p-1 gap-4">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`
                  px-3 py-1 rounded-md text-sm font-medium transition-smooth cursor-pointer
                  ${
                    language === lang
                      ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                      : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                  }
                `}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-[var(--color-destructive)] bg-opacity-20 p-3 text-red-200 animate-scale-in">
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={loginWithVKID}
            disabled={loading}
            className="w-full rounded-lg gradient-primary py-3 px-4 text-white transition-smooth hover-lift flex items-center justify-center disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <svg
                className="mr-2 h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className="mr-2 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.049-1.714-1.033-1.033-1.49-1.172-1.744-1.172-.356 0-.458.102-.458.593v1.566c0 .424-.136.678-1.252.678-1.846 0-3.896-1.118-5.339-3.202-2.166-3.015-2.76-5.275-2.76-5.745 0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.864 2.506 2.302 4.7 2.895 4.7.22 0 .322-.102.322-.66V9.889c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.76c.373 0 .508.203.508.66v3.54c0 .373.17.508.271.508.22 0 .407-.135.814-.542 1.27-1.422 2.183-3.608 2.183-3.608.119-.254.305-.491.745-.491h1.744c.525 0 .644.27.525.66-.22 1.015-2.354 4.03-2.354 4.03-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.048.17.491-.085.745-.576.745z" />
              </svg>
            )}
            {loading ? t("auth.loginButtonLoading") : t("auth.loginButton")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
