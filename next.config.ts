import webpack from "webpack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React 严格模式
  reactStrictMode: true,

  // 性能优化：启用 SWC 压缩
  swcMinify: true,

  // 压缩配置
  compress: true,

  // 生产环境优化
  productionBrowserSourceMaps: false, // 生产环境不生成 source maps，提升构建速度

  // 图片优化
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 实验性功能
  experimental: {
    // 优化包导入
    optimizePackageImports: ["antd"],
  },

  // 注意：由于 @ffmpeg/ffmpeg 与 Turbopack 不兼容，开发环境使用 webpack
  // 如需使用 Turbopack，请在 dev 脚本中移除 --webpack 标志
  // turbopack: {},

  // Webpack 配置（生产构建）
  webpack: (config, { isServer }) => {
    // 客户端 polyfills
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
        new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
          const mod = resource.request.replace(/^node:/, "");
          switch (mod) {
            case "buffer":
              resource.request = "buffer";
              break;
            case "stream":
              resource.request = "readable-stream";
              break;
            default:
              throw new Error(`Not found ${mod}`);
          }
        })
      );
    }

    return config;
  },

  // 安全头配置
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/static/:all*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
