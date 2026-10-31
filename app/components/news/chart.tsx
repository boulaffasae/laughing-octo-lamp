"use client";
import { useEffect, useRef } from "react";
import type { Chart as ChartType } from "chart.js";
import type { ArticleChartData } from "@/lib/news/widgets";
import { captureException } from "@sentry/nextjs";
export default function ArticleChart({
  title,
  labels,
  values,
  source,
}: ArticleChartData) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let chart: ChartType | undefined;
    let cancelled = false;
    import("chart.js/auto")
      .then(({ default: Chart }) => {
        if (!cancelled && canvas.current)
          chart = new Chart(canvas.current, {
            type: "bar",
            data: {
              labels,
              datasets: [
                {
                  label: title,
                  data: values,
                  backgroundColor: "#356451",
                  borderRadius: 6,
                },
              ],
            },
            options: {
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } },
            },
          });
      })
      .catch(() => {
        // The accessible table remains available if the optional chart cannot load.
        if (!cancelled)
          captureException(new Error("Article chart failed to load"));
      });
    return () => {
      cancelled = true;
      chart?.destroy();
    };
  }, [title, labels, values]);
  return (
    <figure className="article-widget">
      <figcaption>{title}</figcaption>
      <canvas ref={canvas} aria-label={title} role="img" />
      <table>
        <thead>
          <tr>
            <th>{title}</th>
            <th>#</th>
          </tr>
        </thead>
        <tbody>
          {labels.map((label, i) => (
            <tr key={label}>
              <th>{label}</th>
              <td>{values[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <small>{source}</small>
    </figure>
  );
}
