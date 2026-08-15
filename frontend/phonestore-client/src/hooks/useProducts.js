import { useEffect, useState } from "react";
import productApi from "../api/productApi";

export default function useProducts() {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(false);

    const [query, setQuery] = useState({

        keyword: "",

        brandId: "",

        categoryId: "",

        minPrice: "",

        maxPrice: "",

        sortBy: "",

        page: 1,

        pageSize: 8

    });

    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {

        loadProducts();

    }, [query]);

    async function loadProducts() {

        try {

            setLoading(true);

            const res = await productApi.query(query);

            setProducts(res.data.items);

            setTotalPages(res.data.totalPages);

        }
        catch (err) {

            console.log(err);

        }
        finally {

            setLoading(false);

        }

    }

    function updateQuery(data) {

        setQuery(prev => ({

            ...prev,

            ...data

        }));

    }

    return {

        products,

        loading,

        query,

        totalPages,

        updateQuery

    };

}