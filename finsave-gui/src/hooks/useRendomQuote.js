import { useState, useEffect } from "react";


export default function useRandomQuote() {
const [state, setState] = useState({ quote: null, loading: true, error: null });


useEffect(() => {
    let isMounted = true;
    (async () => {
        try {
                const res = await fetch("https://dummyjson.com/quotes/random");
                if (!res.ok) throw new Error("Failed to fetch quote");
                const data = await res.json();
                if (isMounted) setState({ quote: data, loading: false, error: null });
            } catch (e) {
                if (isMounted) setState({ quote: null, loading: false, error: e.message });
            }
        })();
    return () => { isMounted = false; };
}, []);


return state; // { quote: {quote, author, id}, loading, error }
}