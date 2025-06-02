export interface CountryData {
  name: string
  dialCode: string
  code: string // ISO 3166-1 alpha-2 code
  flagEmoji: string
}

// Lista parcial de países para demonstração. Em uma aplicação real, esta lista seria mais completa.
export const countries: CountryData[] = [
  { name: "Portugal", dialCode: "+351", code: "PT", flagEmoji: "🇵🇹" },
  { name: "Brasil", dialCode: "+55", code: "BR", flagEmoji: "🇧🇷" },
  { name: "Angola", dialCode: "+244", code: "AO", flagEmoji: "🇦🇴" },
  { name: "Moçambique", dialCode: "+258", code: "MZ", flagEmoji: "🇲🇿" },
  { name: "Cabo Verde", dialCode: "+238", code: "CV", flagEmoji: "🇨🇻" },
  { name: "Espanha", dialCode: "+34", code: "ES", flagEmoji: "🇪🇸" },
  { name: "França", dialCode: "+33", code: "FR", flagEmoji: "🇫🇷" },
  { name: "Alemanha", dialCode: "+49", code: "DE", flagEmoji: "🇩🇪" },
  { name: "Reino Unido", dialCode: "+44", code: "GB", flagEmoji: "🇬🇧" },
  { name: "Estados Unidos", dialCode: "+1", code: "US", flagEmoji: "🇺🇸" },
  { name: "Canadá", dialCode: "+1", code: "CA", flagEmoji: "🇨🇦" },
  { name: "Argentina", dialCode: "+54", code: "AR", flagEmoji: "🇦🇷" },
  { name: "China", dialCode: "+86", code: "CN", flagEmoji: "🇨🇳" },
  { name: "Índia", dialCode: "+91", code: "IN", flagEmoji: "🇮🇳" },
  { name: "Japão", dialCode: "+81", code: "JP", flagEmoji: "🇯🇵" },
  { name: "Austrália", dialCode: "+61", code: "AU", flagEmoji: "🇦🇺" },
  { name: "África do Sul", dialCode: "+27", code: "ZA", flagEmoji: "🇿🇦" },
  // Adicione mais países conforme necessário
]
