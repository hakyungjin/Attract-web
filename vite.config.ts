import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'node:path'
import AutoImport from 'unplugin-auto-import/vite'

const base = process.env.BASE_PATH || '/'
const isPreview = process.env.IS_PREVIEW ? true : false;
// https://vite.dev/config/
export default defineConfig({
  define: {
    __BASE_PATH__: JSON.stringify(base),
    __IS_PREVIEW__: JSON.stringify(isPreview)
  },
  plugins: [react(),
  AutoImport({
    imports: [
      {
        'react': [
          'React',
          'useState',
          'useEffect',
          'useContext',
          'useReducer',
          'useCallback',
          'useMemo',
          'useRef',
          'useImperativeHandle',
          'useLayoutEffect',
          'useDebugValue',
          'useDeferredValue',
          'useId',
          'useInsertionEffect',
          'useSyncExternalStore',
          'useTransition',
          'startTransition',
          'lazy',
          'memo',
          'forwardRef',
          'createContext',
          'createElement',
          'cloneElement',
          'isValidElement'
        ]
      },
      {
        'react-router-dom': [
          'useNavigate',
          'useLocation',
          'useParams',
          'useSearchParams',
          'Link',
          'NavLink',
          'Navigate',
          'Outlet'
        ]
      },
      // React i18n
      {
        'react-i18next': [
          'useTranslation',
          'Trans'
        ]
      }
    ],
    dts: true,
  }),
  ],
  base,
  build: {
    sourcemap: process.env.NODE_ENV === 'development',
    outDir: 'out',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@antigravity/browser': resolve(__dirname, './src/antigravityStub.ts')
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  }
})
