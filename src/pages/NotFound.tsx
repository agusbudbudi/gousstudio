import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ClientPage, EditorialState } from "../components/landing/clientPage";

// Catch-all route. The SPA rewrite serves every URL with HTTP 200, so mark it noindex
// to keep mistyped URLs out of search results.
const NotFound = () => {
  const { pathname } = useLocation();

  return (
    <ClientPage>
      <Helmet>
        <title>Halaman Tidak Ditemukan | Gous Studio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <EditorialState code="404" eyebrow="Error 404" title="Halaman tidak ditemukan.">
        Alamat <span className="break-all font-semibold text-ink">{pathname}</span> tidak ada atau sudah
        dipindahkan. Mulai dari beranda, atau lihat{" "}
        <Link to="/portfolio" className="font-semibold text-ink underline underline-offset-4 hover:text-violet-700">
          portfolio
        </Link>{" "}
        dan{" "}
        <Link to="/pricelist" className="font-semibold text-ink underline underline-offset-4 hover:text-violet-700">
          pricelist
        </Link>
        .
      </EditorialState>
    </ClientPage>
  );
};

export default NotFound;
