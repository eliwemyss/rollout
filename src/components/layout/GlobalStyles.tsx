import { COLORS } from '../../lib/colors';

export const GlobalStyles = () => (
  <style>{`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background-color: ${COLORS.dark};
      color: ${COLORS.textPrimary};
      font-family: 'DM Sans', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    input:focus, textarea:focus {
      border-color: ${COLORS.accent} !important;
    }

    ::placeholder {
      color: ${COLORS.textMuted};
    }

    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: ${COLORS.dark};
    }

    ::-webkit-scrollbar-thumb {
      background: ${COLORS.border};
      border-radius: 4px;
    }
  `}</style>
);
