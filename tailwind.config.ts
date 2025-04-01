
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
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
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				roast: {
					red: "#FF3A2F",
					orange: "#FF9500",
					yellow: "#FFCC00",
					dark: "#1A1A1A",
					"dark-gray": "#2A2A2A",
					"medium-gray": "#444444",
					"light-gray": "#666666",
				},
				candy: {
					pink: "#FF8ABC",
					purple: "#A066D3",
					blue: "#48C4E0",
					green: "#7ED957",
					yellow: "#FFD53F",
					orange: "#FF9838",
					red: "#FF5C5C",
					"bright-pink": "#FF4090",
					"light-pink": "#FFD1E3",
					"light-purple": "#E8D6FF",
					"light-blue": "#C2F0FF",
					"light-green": "#D6FFBD",
					"light-yellow": "#FFF6C2"
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(10px)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'pulse-soft': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.8'
					}
				},
				'slide-in-bottom': {
					'0%': {
						transform: 'translateY(40px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'slide-in-left': {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(0)'
					}
				},
				'slide-in-right': {
					'0%': {
						transform: 'translateX(100%)'
					},
					'100%': {
						transform: 'translateX(0)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				},
				'bounce': {
					'0%, 100%': {
						transform: 'translateY(0)',
						animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
					},
					'50%': {
						transform: 'translateY(-15px)',
						animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
					}
				},
				'candy-spin': {
					'0%': {
						transform: 'rotate(0deg)'
					},
					'100%': {
						transform: 'rotate(360deg)'
					}
				},
				'jelly': {
					'0%, 100%': {
						transform: 'scale(1)'
					},
					'50%': {
						transform: 'scale(1.1)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.4s ease-out',
				'fade-out': 'fade-out 0.4s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
				'slide-in-bottom': 'slide-in-bottom 0.6s ease-out',
				'slide-in-left': 'slide-in-left 0.5s ease-out',
				'slide-in-right': 'slide-in-right 0.5s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'bounce': 'bounce 2s infinite',
				'candy-spin': 'candy-spin 8s linear infinite',
				'jelly': 'jelly 0.5s ease-in-out'
			},
			boxShadow: {
				'candy': '0 8px 20px -4px rgba(255, 138, 188, 0.3)',
				'candy-hover': '0 12px 25px -3px rgba(255, 138, 188, 0.4)',
				'candy-active': '0 4px 10px -2px rgba(255, 138, 188, 0.5)'
			},
			backgroundImage: {
				'candy-gradient': 'linear-gradient(135deg, #FF8ABC 0%, #A066D3 100%)',
				'candy-button': 'linear-gradient(to right, #FF4090, #A066D3)',
				'candy-background': 'radial-gradient(circle, #FFD1E3 0%, #E8D6FF 100%)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
