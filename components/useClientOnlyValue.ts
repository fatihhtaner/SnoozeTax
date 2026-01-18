// This helper hook ensures that components intended to be client-side only 
// (like those using window or specific web APIs) handle server-side rendering gracefully.
import { useEffect, useState } from 'react';

export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
    const [value, setValue] = useState<S | C>(server);

    useEffect(() => {
        setValue(client);
    }, [client]);

    return value;
}
