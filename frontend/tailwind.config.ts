import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				muted: 'hsl(var(--muted))',
				success: 'hsl(var(--success))',
				warning: 'hsl(var(--warning))',
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
			},
			borderRadius: {
				'2xl': '1rem',
				lg: '0.75rem',
				md: '0.5rem',
				sm: '0.25rem',
			},
			boxShadow: {
				xl: '0 8px 32px 0 rgba(16, 21, 40, 0.25)',
				'2xl': '0 12px 48px 0 rgba(16, 21, 40, 0.35)',
				'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
				'glow-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
				'glow-xl': '0 0 60px rgba(99, 102, 241, 0.5)',
			},
			keyframes: {
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				slideUp: {
					from: { opacity: '0', transform: 'translateY(40px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				slideDown: {
					from: { opacity: '0', transform: 'translateY(-40px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				slideLeft: {
					from: { opacity: '0', transform: 'translateX(40px)' },
					to: { opacity: '1', transform: 'translateX(0)' },
				},
				slideRight: {
					from: { opacity: '0', transform: 'translateX(-40px)' },
					to: { opacity: '1', transform: 'translateX(0)' },
				},
				scaleIn: {
					from: { opacity: '0', transform: 'scale(0.9)' },
					to: { opacity: '1', transform: 'scale(1)' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				pulse: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
				bounce: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				gradient: {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
				},
				glow: {
					'0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
					'50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
				},
				wiggle: {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' },
				},
				heartbeat: {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.1)' },
				},
			},
			animation: {
				fadeIn: 'fadeIn 0.7s ease-in',
				slideUp: 'slideUp 0.7s cubic-bezier(0.4,0,0.2,1)',
				slideDown: 'slideDown 0.7s cubic-bezier(0.4,0,0.2,1)',
				slideLeft: 'slideLeft 0.7s cubic-bezier(0.4,0,0.2,1)',
				slideRight: 'slideRight 0.7s cubic-bezier(0.4,0,0.2,1)',
				scaleIn: 'scaleIn 0.7s cubic-bezier(0.4,0,0.2,1)',
				shimmer: 'shimmer 1.5s infinite linear',
				float: 'float 3s ease-in-out infinite',
				pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				bounce: 'bounce 2s infinite',
				gradient: 'gradient 8s ease infinite',
				glow: 'glow 2s ease-in-out infinite',
				wiggle: 'wiggle 1s ease-in-out infinite',
				heartbeat: 'heartbeat 1.5s ease-in-out infinite',
			},
			backdropBlur: {
				xs: '2px',
			},
			transitionTimingFunction: {
				'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
			},
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
