import { Portfolio, PortfolioListResponse } from "@/types/portfolio";
import { Criteria } from "@/types/criteria";

// Portfolio Service Base URL
const PORTFOLIO_API_BASE_URL = import.meta.env.VITE_PORTFOLIO_API_BASE_URL || 
  "https://portfolio-service.redmushroom-1d023c6a.southeastasia.azurecontainerapps.io/api";

export const portfolioAPI = {
  /**
   * Fetch all portfolios
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 10)
   * @returns Portfolio list with pagination info
   */
  getPortfolios: async (page: number = 1, pageSize: number = 10): Promise<PortfolioListResponse> => {
    try {
      console.log("📋 Fetching portfolios - Page:", page, "PageSize:", pageSize);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("⏱️ Portfolio request timeout sau 30 giây");
        controller.abort();
      }, 30000); // 30 second timeout

      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await fetch(
        `${PORTFOLIO_API_BASE_URL}/Portfolio?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log("📡 Response status:", response.status);

      const contentType = response.headers.get("content-type");
      let data: PortfolioListResponse;

      if (contentType?.includes("application/json")) {
        try {
          data = await response.json();
          console.log("📦 Portfolio data fetched:", {
            total: data.total,
            items: data.items.length,
            page: data.page,
            totalPages: data.totalPages,
          });
        } catch (parseError) {
          console.error("❌ JSON parse error:", parseError);
          throw new Error("Invalid response format from server (JSON parse failed)");
        }
      } else {
        console.error("❌ Invalid response content type:", contentType);
        throw new Error("Server returned non-JSON response");
      }

      if (!response.ok) {
        console.error("❌ Portfolio fetch failed with status:", response.status);
        throw new Error(`Failed to fetch portfolios: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("❌ Portfolio fetch error:", error);
      throw error;
    }
  },

  /**
   * Fetch a single portfolio by ID
   * @param portfolioId - Portfolio ID
   * @returns Portfolio details
   */
  getPortfolioById: async (portfolioId: number): Promise<Portfolio> => {
    try {
      console.log("📋 Fetching portfolio by ID:", portfolioId);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("⏱️ Portfolio detail request timeout sau 30 giây");
        controller.abort();
      }, 30000);

      const response = await fetch(
        `${PORTFOLIO_API_BASE_URL}/Portfolio/${portfolioId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log("📡 Response status:", response.status);

      const contentType = response.headers.get("content-type");
      let data: Portfolio;

      if (contentType?.includes("application/json")) {
        try {
          data = await response.json();
          console.log("📦 Portfolio detail fetched:", {
            portfolioId: data.portfolioId,
            portfolioName: data.portfolioName,
            blocks: data.blocks.length,
          });
        } catch (parseError) {
          console.error("❌ JSON parse error:", parseError);
          throw new Error("Invalid response format from server (JSON parse failed)");
        }
      } else {
        console.error("❌ Invalid response content type:", contentType);
        throw new Error("Server returned non-JSON response");
      }

      if (!response.ok) {
        console.error("❌ Portfolio detail fetch failed with status:", response.status);
        throw new Error(`Failed to fetch portfolio: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("❌ Portfolio detail fetch error:", error);
      throw error;
    }
  },

  /**
   * Fetch portfolios for a specific employee
   * @param employeeId - Employee ID
   * @returns Portfolio list for the employee
   */
  getEmployeePortfolios: async (employeeId: number): Promise<PortfolioListResponse> => {
    try {
      console.log("📋 Fetching portfolios for employee:", employeeId);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("⏱️ Employee portfolio request timeout sau 30 giây");
        controller.abort();
      }, 30000);

      const response = await fetch(
        `${PORTFOLIO_API_BASE_URL}/Portfolio/employee/${employeeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log("📡 Response status:", response.status);

      const contentType = response.headers.get("content-type");
      let data: PortfolioListResponse;

      if (contentType?.includes("application/json")) {
        try {
          data = await response.json();
          console.log("📦 Employee portfolios fetched:", {
            total: data.total,
            items: data.items.length,
          });
        } catch (parseError) {
          console.error("❌ JSON parse error:", parseError);
          throw new Error("Invalid response format from server (JSON parse failed)");
        }
      } else {
        console.error("❌ Invalid response content type:", contentType);
        throw new Error("Server returned non-JSON response");
      }

      if (!response.ok) {
        console.error("❌ Employee portfolio fetch failed with status:", response.status);
        throw new Error(`Failed to fetch employee portfolios: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("❌ Employee portfolio fetch error:", error);
      throw error;
    }
  },

  /**
   * Fetch the main portfolio for a specific employee
   * @param employeeId - Employee ID
   * @returns Main Portfolio
   */
  getEmployeeMainPortfolio: async (employeeId: number): Promise<Portfolio> => {
    try {
      console.log("📋 Fetching main portfolio for employee:", employeeId);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("⏱️ Main portfolio request timeout sau 30 giây");
        controller.abort();
      }, 30000);

      const response = await fetch(
        `${PORTFOLIO_API_BASE_URL}/Portfolio/employee/${employeeId}/main`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log("📡 Response status:", response.status);

      const contentType = response.headers.get("content-type");
      let data: Portfolio;

      if (contentType?.includes("application/json")) {
        try {
          data = await response.json();
          console.log("📦 Main portfolio fetched:", {
            portfolioId: data.portfolioId,
            portfolioName: data.portfolioName,
          });
        } catch (parseError) {
          console.error("❌ JSON parse error:", parseError);
          throw new Error("Invalid response format from server (JSON parse failed)");
        }
      } else {
        console.error("❌ Invalid response content type:", contentType);
        throw new Error("Server returned non-JSON response");
      }

      if (!response.ok) {
        console.error("❌ Main portfolio fetch failed with status:", response.status);
        throw new Error(`Failed to fetch main portfolio: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("❌ Main portfolio fetch error:", error);
      throw error;
    }
  },

  /**
   * Fetch the current user's portfolio
   * @returns Current user's Portfolio
   */
  getCurrentUserPortfolio: async (): Promise<Portfolio> => {
    try {
      console.log("📋 Fetching current user's portfolio");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("⏱️ Current user portfolio request timeout sau 30 giây");
        controller.abort();
      }, 30000);

      const response = await fetch(`${PORTFOLIO_API_BASE_URL}/Portfolio/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("📡 Response status:", response.status);

      const contentType = response.headers.get("content-type");
      let data: Portfolio;

      if (contentType?.includes("application/json")) {
        try {
          data = await response.json();
          console.log("📦 Current user portfolio fetched:", {
            portfolioId: data.portfolioId,
            portfolioName: data.portfolioName,
          });
        } catch (parseError) {
          console.error("❌ JSON parse error:", parseError);
          throw new Error("Invalid response format from server (JSON parse failed)");
        }
      } else {
        console.error("❌ Invalid response content type:", contentType);
        throw new Error("Server returned non-JSON response");
      }

      if (!response.ok) {
        console.error("❌ Current user portfolio fetch failed with status:", response.status);
        throw new Error(`Failed to fetch current user portfolio: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("❌ Current user portfolio fetch error:", error);
      throw error;
    }
  },

  /**
   * Fetch all criteria
   * @param accessToken - Authorization token
   * @returns Criteria list
   */
  getCriteria: async (accessToken?: string): Promise<Criteria[]> => {
    try {
      console.log("📋 Fetching criteria");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("⏱️ Criteria request timeout sau 30 giây");
        controller.abort();
      }, 30000);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `${PORTFOLIO_API_BASE_URL}/admin/criteria`,
        {
          method: "GET",
          headers,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log("📡 Response status:", response.status);

      const contentType = response.headers.get("content-type");
      let data: Criteria[];

      if (contentType?.includes("application/json")) {
        try {
          data = await response.json();
          console.log("📦 Criteria fetched:", {
            count: data.length,
          });
        } catch (parseError) {
          console.error("❌ JSON parse error:", parseError);
          throw new Error("Invalid response format from server (JSON parse failed)");
        }
      } else {
        console.error("❌ Invalid response content type:", contentType);
        throw new Error("Server returned non-JSON response");
      }

      if (!response.ok) {
        console.error("❌ Criteria fetch failed with status:", response.status);
        throw new Error(`Failed to fetch criteria: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("❌ Criteria fetch error:", error);
      throw error;
    }
  },

  /**
   * Create a new criterion
   * @param criteriaData - Criterion data (name, kind)
   * @param accessToken - Authorization token
   * @returns Created criterion
   */
  createCriteria: async (criteriaData: { name: string; kind: string }, accessToken?: string): Promise<Criteria> => {
    try {
      console.log("➕ Creating new criterion:", criteriaData);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("⏱️ Create criterion request timeout sau 30 giây");
        controller.abort();
      }, 30000);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `${PORTFOLIO_API_BASE_URL}/admin/criteria`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(criteriaData),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log("📡 Response status:", response.status);

      const contentType = response.headers.get("content-type");
      let data: Criteria;

      if (contentType?.includes("application/json")) {
        try {
          data = await response.json();
          console.log("📦 Criterion created:", data);
        } catch (parseError) {
          console.error("❌ JSON parse error:", parseError);
          throw new Error("Invalid response format from server (JSON parse failed)");
        }
      } else {
        console.error("❌ Invalid response content type:", contentType);
        throw new Error("Server returned non-JSON response");
      }

      if (!response.ok) {
        console.error("❌ Create criterion failed with status:", response.status);
        throw new Error(`Failed to create criterion: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("❌ Create criterion error:", error);
      throw error;
    }
  },

  /**
   * Update a criterion by ID
   * @param id - Criterion ID
   * @param criteriaData - Criterion data (name, kind)
   * @param accessToken - Authorization token
   * @returns Updated criterion
   */
  updateCriteria: async (id: number, criteriaData: { name: string; kind: string }, accessToken?: string): Promise<Criteria> => {
    try {
      console.log("✏️ Updating criterion:", id, criteriaData);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("⏱️ Update criterion request timeout sau 30 giây");
        controller.abort();
      }, 30000);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `${PORTFOLIO_API_BASE_URL}/admin/criteria/${id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(criteriaData),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log("📡 Response status:", response.status);

      const contentType = response.headers.get("content-type");
      let data: Criteria;

      if (contentType?.includes("application/json")) {
        try {
          data = await response.json();
          console.log("📦 Criterion updated:", data);
        } catch (parseError) {
          console.error("❌ JSON parse error:", parseError);
          throw new Error("Invalid response format from server (JSON parse failed)");
        }
      } else {
        console.error("❌ Invalid response content type:", contentType);
        throw new Error("Server returned non-JSON response");
      }

      if (!response.ok) {
        console.error("❌ Update criterion failed with status:", response.status);
        throw new Error(`Failed to update criterion: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("❌ Update criterion error:", error);
      throw error;
    }
  },

  /**
   * Toggle criterion status (soft delete) by ID
   * @param id - Criterion ID
   * @param accessToken - Authorization token
   * @returns Updated criterion with new status
   */
  toggleCriteria: async (id: number, accessToken?: string): Promise<{ message: string; criterion: Criteria }> => {
    try {
      console.log("🔄 Toggling criterion status:", id);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("⏱️ Toggle criterion request timeout sau 30 giây");
        controller.abort();
      }, 30000);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `${PORTFOLIO_API_BASE_URL}/admin/criteria/${id}/toggle`,
        {
          method: "PATCH",
          headers,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log("📡 Response status:", response.status);

      const contentType = response.headers.get("content-type");
      let data: { message: string; criterion: Criteria };

      if (contentType?.includes("application/json")) {
        try {
          data = await response.json();
          console.log("📦 Criterion toggled:", data);
        } catch (parseError) {
          console.error("❌ JSON parse error:", parseError);
          throw new Error("Invalid response format from server (JSON parse failed)");
        }
      } else {
        console.error("❌ Invalid response content type:", contentType);
        throw new Error("Server returned non-JSON response");
      }

      if (!response.ok) {
        console.error("❌ Toggle criterion failed with status:", response.status);
        throw new Error(`Failed to toggle criterion: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("❌ Toggle criterion error:", error);
      throw error;
    }
  },

  /**
   * Delete a criterion by ID
   * @param id - Criterion ID
   * @param accessToken - Authorization token
   * @returns Delete response message
   */
  deleteCriteria: async (id: number, accessToken?: string): Promise<{ message: string }> => {
    try {
      console.log("🗑️ Deleting criterion:", id);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("⏱️ Delete criterion request timeout sau 30 giây");
        controller.abort();
      }, 30000);

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `${PORTFOLIO_API_BASE_URL}/admin/criteria/${id}`,
        {
          method: "DELETE",
          headers,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log("📡 Response status:", response.status);

      const contentType = response.headers.get("content-type");
      let data: { message: string };

      if (contentType?.includes("application/json")) {
        try {
          data = await response.json();
          console.log("📦 Criterion deleted:", data);
        } catch (parseError) {
          console.error("❌ JSON parse error:", parseError);
          throw new Error("Invalid response format from server (JSON parse failed)");
        }
      } else {
        console.error("❌ Invalid response content type:", contentType);
        throw new Error("Server returned non-JSON response");
      }

      if (!response.ok) {
        console.error("❌ Delete criterion failed with status:", response.status);
        throw new Error(`Failed to delete criterion: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("❌ Delete criterion error:", error);
      throw error;
    }
  },
};
