import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            animation: {
                "scale-in-center": "scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940)   both",
                "tracking-in-expand": "tracking-in-expand 0.7s cubic-bezier(0.215, 0.610, 0.355, 1.000)   both"
            },
            keyframes: {
                "scale-in-center": {
                    "0%": {
                        transform: "scale(0)",
                        opacity: "1"
                    },
                    to: {
                        transform: "scale(1)",
                        opacity: "1"
                    }
                },
                "tracking-in-expand": {
                    "0%": {
                        "letter-spacing": "-.5em",
                        opacity: "0"
                    },
                    "40%": {
                        opacity: ".6"
                    },
                    to: {
                        opacity: "1"
                    }
                }
            }
        },
    },
    daisyui: {
        themes: [
            "light",
            "dark",
            "cupcake",
            "bumblebee",
            "emerald",
            "corporate",
            "synthwave",
            "retro",
            "cyberpunk",
            "valentine",
            "halloween",
            "garden",
            "forest",
            "aqua",
            "lofi",
            "pastel",
            "fantasy",
            "wireframe",
            "black",
            "luxury",
            "dracula",
            "cmyk",
            "autumn",
            "business",
            "acid",
            "lemonade",
            "night",
            "coffee",
            "winter",
            "dim",
            "nord",
            "sunset",
        ],
    },
    plugins: [require('daisyui')],
}
export default config
