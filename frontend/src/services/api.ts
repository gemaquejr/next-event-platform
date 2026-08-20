const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3333';

interface ApiRequestOptions
    extends RequestInit {
    token?: string;
}

export async function apiFetch<T>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const {
        token,
        headers,
        ...fetchOptions
    } = options;

    const response = await fetch(
        `${API_URL}${path}`,
        {
            ...fetchOptions,
            headers: {
                'Content-Type': 'application/json',
                ...(token
                    ? {
                        Authorization: `Bearer ${token}`,
                    }
                    : {}),
                ...headers,
            },
        },
    );

    if (!response.ok) {
        let message =
            'An unexpected error occurred';

        try {
            const data = await response.json();

            if (data?.message) {
                message = Array.isArray(data.message)
                    ? data.message.join(', ')
                    : data.message;
            }
        } catch {

        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}