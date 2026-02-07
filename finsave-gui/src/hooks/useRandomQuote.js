import { useState, useEffect } from "react";


export default function useRandomUserImage() {
    const [state, setState] = useState({ image: null, name: null, loading: true, error: null });

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
            const res = await fetch("https://randomuser.me/api/");
            if (!res.ok) throw new Error("Failed to fetch user");
            const data = await res.json();
            const user = data.results[0];
                if (isMounted) {
                    setState({
                        image: user.picture.large,
                        name: `${user.name.first} ${user.name.last}`,
                        loading: false,
                        error: null,
                    });
                }
            } catch (e) {
                if (isMounted) setState({ image: null, name: null, loading: false, error: e.message });
            }
        })();
        return () => { isMounted = false; };
    }, []);


    return state; // { image, name, loading, error }
}