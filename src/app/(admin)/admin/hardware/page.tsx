import { redirect } from "next/navigation";

import { HARDWARE_FOLDER } from "@/constants/admin-navigation";
import { authService } from "@/services/auth.service";

// الهاردوير is a sidebar folder, not a page: /admin/hardware goes to its
// first section (المبرمجات).
export default async function AdminHardwarePage() {
  await authService.requireAdmin();
  redirect(HARDWARE_FOLDER.items[0].href);
}
