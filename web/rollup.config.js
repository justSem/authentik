import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import sourcemaps from "rollup-plugin-sourcemaps";
import typescript from "@rollup/plugin-typescript";
import cssimport from "rollup-plugin-cssimport";
import copy from "rollup-plugin-copy";
import babel from "@rollup/plugin-babel";
import replace from "@rollup/plugin-replace";

const extensions = [
    ".js", ".jsx", ".ts", ".tsx",
];

const resources = [
    { src: "node_modules/rapidoc/dist/rapidoc-min.js", dest: "dist/" },

    { src: "node_modules/@patternfly/patternfly/patternfly.min.css", dest: "dist/" },
    { src: "node_modules/@patternfly/patternfly/patternfly-base.css", dest: "dist/" },
    { src: "node_modules/@patternfly/patternfly/components/Page/page.css", dest: "dist/" },
    { src: "node_modules/@patternfly/patternfly/components/EmptyState/empty-state.css", dest: "dist/" },
    { src: "node_modules/@patternfly/patternfly/components/Spinner/spinner.css", dest: "dist/" },
    { src: "src/authentik.css", dest: "dist/" },

    { src: "node_modules/@patternfly/patternfly/assets/*", dest: "dist/assets/" },
    { src: "src/interfaces/admin/index.html", dest: "dist/if/admin/" },
    { src: "src/interfaces/flow/index.html", dest: "dist/if/flow/" },
    { src: "src/assets/*", dest: "dist/assets" },
    { src: "./icons/*", dest: "dist/assets/icons" },
];

// eslint-disable-next-line no-undef
const isProdBuild = process.env.NODE_ENV === "production";
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function manualChunks(id) {
    if (id.endsWith("web/api/dist/index.js")) {
        return "api";
    }
    if (id.includes("locales")) {
        const parts = id.split("/");
        const file = parts[parts.length - 1];
        return "locale-" + file.replace(".ts", "");
    }
    if (id.includes("node_modules")) {
        if (id.includes("codemirror")) {
            return "vendor-cm";
        }
        return "vendor";
    }
}

export default [
    // Autogenerated API Client
    {
        input: "./api/src/index.ts",
        output: [
            {
                format: "es",
                dir: "./api/dist/",
                sourcemap: true,
            },
        ],
        plugins: [
            typescript({
                "declaration": true,
                "outDir": "./api/dist/",
            }),
            isProdBuild && terser(),
            copy({
                targets: [...resources],
                copyOnce: false,
            }),
        ].filter(p => p),
        watch: {
            clearScreen: false,
        },
    },
    // Polyfills (imported first)
    {
        input: "./poly.ts",
        output: [
            {
                format: "iife",
                file: "dist/poly.js",
                sourcemap: true,
            }
        ],
        plugins: [
            cssimport(),
            resolve({ browser: true }),
            commonjs(),
            isProdBuild && terser(),
        ].filter(p => p),
        watch: {
            clearScreen: false,
        },
    },
    // Main Application
    {
        input: "./src/interfaces/AdminInterface.ts",
        output: [
            {
                format: "es",
                dir: "dist",
                sourcemap: true,
                manualChunks: manualChunks,
                chunkFileNames: "admin-[name].js"
            },
        ],
        plugins: [
            cssimport(),
            resolve({ extensions, browser: true }),
            commonjs(),
            babel({
                extensions,
                babelHelpers: "runtime",
                include: ["src/**/*"],
            }),
            replace({
                "process.env.NODE_ENV": JSON.stringify(isProdBuild ? "production" : "development"),
                preventAssignment: true
            }),
            sourcemaps(),
            isProdBuild && terser(),
        ].filter(p => p),
        watch: {
            clearScreen: false,
        },
    },
    // Flow executor
    {
        input: "./src/interfaces/FlowInterface.ts",
        output: [
            {
                format: "es",
                dir: "dist",
                sourcemap: true,
                manualChunks: manualChunks,
                chunkFileNames: "flow-[name].js"
            },
        ],
        plugins: [
            cssimport(),
            resolve({ extensions, browser: true }),
            commonjs(),
            babel({
                extensions,
                babelHelpers: "runtime",
                include: ["src/**/*"],
            }),
            replace({
                "process.env.NODE_ENV": JSON.stringify(isProdBuild ? "production" : "development"),
                preventAssignment: true
            }),
            sourcemaps(),
            isProdBuild && terser(),
        ].filter(p => p),
        watch: {
            clearScreen: false,
        },
    },
];
