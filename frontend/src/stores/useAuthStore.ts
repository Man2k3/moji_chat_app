import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";
import { persist } from "zustand/middleware";
import { useChatStore } from "./useChatStore";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      loading: false,

      clearState: () => {
        set({ accessToken: null, user: null, loading: false });
        useChatStore.getState().reset(); // Clear chat state khi đăng xuất
        localStorage.clear();
        sessionStorage.clear();
      },
      setAccessToken: (accessToken: string) => set({ accessToken }),
      setUser: (user) => {
        set({ user });
      },

      signUp: async (username, password, email, firstName, lastName) => {
        set({ loading: true });
        try {
          await authService.signUp(
            username,
            password,
            email,
            firstName,
            lastName,
          );

          toast.success(
            "Đăng ký thành công! Bạn sẽ được chuyển sang trang đăng nhập.",
          );
        } catch (error) {
          console.error("Sign up failed:", error);
          toast.error("Đăng ký không thành công");
          throw error; // Rethrow để component có thể xử lý nếu cần
        } finally {
          set({ loading: false });
        }
      },
      signIn: async (username, password) => {
        get().clearState(); // Clear state trước khi đăng nhập để tránh dữ liệu cũ
        set({ loading: true });
        try {
          const { accessToken } = await authService.signIn(username, password);
          get().setAccessToken(accessToken);
          await get().fetchMe();
          useChatStore.getState().fetchConversations(); // Fetch conversations ngay sau khi đăng nhập thành công
          toast.success("Chào mừng trở lại với Moji!");
        } catch (error) {
          console.error("Sign in failed:", error);
          toast.error("Đăng nhập không thành công");
          throw error; // Rethrow để component có thể xử lý nếu cần
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        try {
          get().clearState();
          await authService.signOut();

          toast.success("Đăng xuất thành công!");
        } catch (error) {
          console.error("Sign out failed:", error);
          toast.error("Đăng xuất không thành công");
        }
      },
      fetchMe: async () => {
        try {
          set({ loading: true });
          const user = await authService.fetchMe();
          set({ user });
        } catch (error) {
          console.error(error);
          set({ user: null, accessToken: null });
          toast.error("Lỗi xảy ra khi lấy dữ liệu người dùng. Hãy thử lại!");
        } finally {
          set({ loading: false });
        }
      },
      refresh: async () => {
        try {
          set({ loading: true });
          const { user, fetchMe, setAccessToken } = get();
          const accessToken = await authService.refresh();
          setAccessToken(accessToken);
          if (!user) {
            await fetchMe();
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
          toast.error("Phiên đã hết hạn. Vui lòng đăng nhập lại.");
          get().clearState();
        } finally {
          set({ loading: false });
        }
      },
    }),
    { name: "auth-storage", partialize: (state) => ({ user: state.user }) }, // chỉ percist user
  ),
);
