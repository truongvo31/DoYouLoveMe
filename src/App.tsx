import {
  Button,
  FluentProvider,
  Text,
  makeStyles,
  shorthands,
  tokens,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';
import { HandOpenHeartRegular, HeartRegular } from '@fluentui/react-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useNavigate } from 'react-router-dom';

const AGREED_EMAIL_LOCK_KEY = 'agreed-email-sent-v1';
const agreedEmailInFlight = new Set<string>();

const useStyles = makeStyles({
  appRoot: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: `linear-gradient(140deg, ${tokens.colorNeutralBackground3}, ${tokens.colorBrandBackground2})`,
    ...shorthands.padding(tokens.spacingVerticalXXL, tokens.spacingHorizontalXXL),
    boxSizing: 'border-box',
  },
  languageWrap: {
    position: 'fixed',
    top: tokens.spacingVerticalL,
    right: tokens.spacingHorizontalL,
    zIndex: 30,
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
  },
  centerContent: {
    width: 'min(760px, 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalL,
    textAlign: 'center',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalSNudge,
  },
  heart: {
    color: tokens.colorPaletteRedForeground1,
  },
  question: {
    margin: 0,
    fontSize: tokens.fontSizeHero700,
    lineHeight: tokens.lineHeightHero700,
    color: tokens.colorNeutralForeground1,
  },
  hint: {
    color: tokens.colorNeutralForeground2,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
  },
  noButtonFloating: {
    position: 'fixed',
    zIndex: 20,
    transitionProperty: 'left, top',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveAccelerateMid,
  },
  agreedWrap: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.padding(tokens.spacingVerticalXL),
    boxSizing: 'border-box',
  },
  agreedCard: {
    width: 'min(500px, 100%)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    ...shorthands.padding(tokens.spacingVerticalXL, tokens.spacingHorizontalXL),
  },
});

function HomePage() {
  const styles = useStyles();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isNoEscaped, setIsNoEscaped] = useState(false);
  const [noPosition, setNoPosition] = useState({ left: 0, top: 0 });

  const rectsOverlap = (
    a: { left: number; top: number; right: number; bottom: number },
    b: DOMRect,
    gap: number,
  ) => {
    return !(
      a.right + gap < b.left ||
      a.left - gap > b.right ||
      a.bottom + gap < b.top ||
      a.top - gap > b.bottom
    );
  };

  const pickNoPosition = useCallback(() => {
    const noButton = noButtonRef.current;
    if (!noButton) {
      return;
    }

    const width = noButton.offsetWidth || 90;
    const height = noButton.offsetHeight || 36;
    const safePadding = 8;
    const protectGap = 14;

    const maxLeft = Math.max(safePadding, window.innerWidth - width - safePadding);
    const maxTop = Math.max(safePadding, window.innerHeight - height - safePadding);

    const protectedRects: DOMRect[] = [];
    if (languageRef.current) {
      protectedRects.push(languageRef.current.getBoundingClientRect());
    }
    if (contentRef.current) {
      protectedRects.push(contentRef.current.getBoundingClientRect());
    }

    for (let i = 0; i < 120; i += 1) {
      const left = Math.floor(Math.random() * (maxLeft - safePadding + 1)) + safePadding;
      const top = Math.floor(Math.random() * (maxTop - safePadding + 1)) + safePadding;
      const candidate = { left, top, right: left + width, bottom: top + height };
      const blocked = protectedRects.some((rect) => rectsOverlap(candidate, rect, protectGap));
      if (!blocked) {
        setNoPosition({ left, top });
        return;
      }
    }

    setNoPosition({ left: maxLeft, top: maxTop });
  }, []);

  const moveNoButton = useCallback(() => {
    setIsNoEscaped(true);
    requestAnimationFrame(() => {
      pickNoPosition();
    });
  }, [pickNoPosition]);

  useEffect(() => {
    if (!isNoEscaped) {
      return;
    }

    const handleResize = () => {
      pickNoPosition();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isNoEscaped, pickNoPosition]);

  return (
    <div className={styles.appRoot}>
      <div className={styles.languageWrap} ref={languageRef}>
        <Button
          size="small"
          appearance={i18n.language === 'en' ? 'primary' : 'subtle'}
          onClick={() => i18n.changeLanguage('en')}
        >
          <Text>EN</Text>
        </Button>
        <Button
          size="small"
          appearance={i18n.language === 'vi' ? 'primary' : 'subtle'}
          onClick={() => i18n.changeLanguage('vi')}
        >
          <Text>VI</Text>
        </Button>
      </div>

      <div className={styles.centerContent} ref={contentRef}>
        <div className={styles.brandRow}>
          <HeartRegular className={styles.heart} fontSize={24} />
          <Text as="h1" className={styles.question}>
            {t('app.name')}
          </Text>
        </div>

        {/* <Text as="h1" className={styles.question}>
          {t('home.question')}
        </Text> */}
        <Text className={styles.hint}>{t('home.hint')}</Text>

        <div className={styles.actions}>
          <Button appearance="primary" onClick={() => navigate('/agreed')}>
            <Text>{t('home.yes')}</Text>
          </Button>
          {!isNoEscaped ? (
            <Button ref={noButtonRef} onMouseEnter={moveNoButton} onClick={moveNoButton}>
              <Text>{t('home.no')}</Text>
            </Button>
          ) : null}
        </div>
      </div>

      {isNoEscaped ? (
        <Button
          ref={noButtonRef}
          className={styles.noButtonFloating}
          style={{ left: noPosition.left, top: noPosition.top }}
          onMouseEnter={moveNoButton}
          onClick={moveNoButton}
        >
          <Text>{t('home.no')}</Text>
        </Button>
      ) : null}
    </div>
  );
}

function AgreedPage() {
  const styles = useStyles();
  const { t } = useTranslation();

  useEffect(() => {
    const lockKey = AGREED_EMAIL_LOCK_KEY;
    const hasSentAlready = window.localStorage.getItem(lockKey) === '1';
    if (hasSentAlready) {
      return;
    }

    if (agreedEmailInFlight.has(lockKey)) {
      return;
    }

    agreedEmailInFlight.add(lockKey);

    const sendRequest = async () => {
      try {
        const response = await fetch(
          'https://pokedex-dyhgeefqd4avf9f5.japanwest-01.azurewebsites.net/api/utils/sendmail',
          {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'X-Dev-Access-Key': import.meta.env.VITE_DEV_ACCESS_KEY,
            },
            body: JSON.stringify({
              name: 'DoYouLoveMe-App',
              email: 'nguyenvuhoangphong@gmail.com',
              subject: 'Hà đã đồng ý',
              message: 'Hà đã thừa nhận là thích Phong rồi. Chúc mừng nhé.',
            }),
          },
        );

        if (response.ok) {
          window.localStorage.setItem(lockKey, '1');
          return;
        }

        console.error('Failed to send agreed email', response.status, response.statusText);
      } catch (error) {
        console.error(error);
      } finally {
        agreedEmailInFlight.delete(lockKey);
      }
    };

    sendRequest();
  }, []);

  return (
    <div className={styles.appRoot}>
      <Text as="h2" size={600}>
        {t('agreed.title')} &nbsp;
      </Text>
      <HandOpenHeartRegular fontSize={24} />
    </div>
  );
}

function App() {
  const prefersDark =
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isDark, setIsDark] = useState(prefersDark);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const handleThemeChange = (event: MediaQueryListEvent) => {
      setIsDark(event.matches);
    };

    media.addEventListener('change', handleThemeChange);
    return () => {
      media.removeEventListener('change', handleThemeChange);
    };
  }, []);

  const theme = useMemo(() => (isDark ? webDarkTheme : webLightTheme), [isDark]);

  return (
    <FluentProvider theme={theme}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/agreed" element={<AgreedPage />} />
      </Routes>
    </FluentProvider>
  );
}

export default App;
