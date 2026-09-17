


import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSelector } from "react-redux";

const apiUrlV2 = "https://eduxl2-production-daa2.up.railway.app/api";

// "https://eduxl2-production-daa2.up.railway.app/api/users/",

const fetchDataV2 = async (url, token) => {
  try {
    const response = await axios.get(`${apiUrlV2}${url}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", { response: error?.response?.data });
    throw error;
  }
};

// ── JSON mutation (POST/PATCH/DELETE without file upload) ─────────────────────
const mutateDataV2 = async ({ url, token, data, method = "POST" }) => {
  try {
    const response = await axios({
      method,
      url: `${apiUrlV2}${url}`,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in mutateData:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Something went wrong while mutating data",
    );
  }
};

// ── FormData mutation (POST/PATCH with file upload) ───────────────────────────
const mutateFormDataV2 = async ({ url, token, data, method = "POST" }) => {
  try {
    const response = await axios({
      method,
      url: `${apiUrlV2}${url}`,
      data, // FormData instance passed directly
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in mutateFormData:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Something went wrong while uploading data",
    );
  }
};

export const useFetchDataV2 = (url, queryKey, options = {}) => {
  const { user } = useSelector((state) => state?.reducer?.AuthSlice);
  const token = user?.token;

  return useQuery({
    queryKey: [queryKey, token],
    queryFn: () => fetchDataV2(url, token),
    retry: 2,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

// ── JSON mutation hook ─────────────────────────────────────────────────────────
export const useMutateDataV2 = (queryKey, method = "POST") => {
  const { user } = useSelector((state) => state?.reducer?.AuthSlice);
  const token = user?.token;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ url, data }) => mutateDataV2({ url, token, data, method }),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
    },
    onError: (error) => {
      throw error?.response;
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isPending,
  };
};

// ── FormData mutation hook (for file uploads) ─────────────────────────────────
export const useFormDataMutateV2 = (queryKey, method = "POST") => {
  const { user } = useSelector((state) => state?.reducer?.AuthSlice);
  const token = user?.token;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ url, data }) =>
      mutateFormDataV2({ url, token, data, method }),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
    },
    onError: (error) => {
      throw error?.response;
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isPending,
  };
};