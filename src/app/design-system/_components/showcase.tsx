"use client"

import { useState } from "react"
import {
  Check,
  CircuitBoard,
  Cpu,
  Ellipsis,
  FileText,
  Filter,
  Info,
  LogOut,
  Minus,
  Moon,
  Package,
  Phone,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sun,
  Trash2,
  TriangleAlert,
  Truck,
  User,
  Usb,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Ltr, Price, StatusBadge, type StatusTone } from "@/components/shared"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ── Sample data — shaped like prisma/schema.prisma, strings inline because
//    this page is a reference, not a feature (features use messages/ar.ts).

const BRAND_SCALE = [
  ["50", "#fff3f3"],
  ["100", "#ffe7e7"],
  ["200", "#ffd0d1"],
  ["300", "#ffb0b0"],
  ["400", "#ff8987"],
  ["500", "#f3625f"],
  ["600", "#de3b3d"],
  ["700", "#ba2b2b"],
  ["800", "#942222"],
  ["900", "#721c1c"],
  ["950", "#430f10"],
] as const

const SEMANTIC = [
  { name: "primary", label: "الأساسي", className: "bg-primary text-primary-foreground" },
  { name: "primary-soft", label: "أساسي فاتح", className: "bg-primary-soft text-primary-ink" },
  { name: "success", label: "نجاح", className: "bg-success text-white" },
  { name: "warning", label: "تنبيه", className: "bg-warning text-brand-950" },
  { name: "info", label: "معلومة", className: "bg-info text-white" },
  { name: "destructive", label: "حذف / خطأ", className: "bg-destructive text-white" },
  { name: "muted", label: "خافت", className: "bg-muted text-muted-foreground" },
  { name: "foreground", label: "النص", className: "bg-foreground text-background" },
]

const STOCK: { label: string; tone: StatusTone }[] = [
  { label: "متوفر", tone: "success" },
  { label: "كمية محدودة", tone: "warning" },
  { label: "نفد المخزون", tone: "neutral" },
]

const CONDITION: { label: string; tone: StatusTone }[] = [
  { label: "جديد", tone: "info" },
  { label: "مستعمل", tone: "neutral" },
  { label: "مجدد", tone: "success" },
  { label: "فيرجن", tone: "brand" },
]

const ORDER_STATUS: { key: string; label: string; tone: StatusTone }[] = [
  { key: "PENDING_PAYMENT", label: "في انتظار الدفع", tone: "warning" },
  { key: "PENDING_CONFIRMATION", label: "في انتظار التأكيد", tone: "warning" },
  { key: "CONFIRMED", label: "تم التأكيد", tone: "info" },
  { key: "PROCESSING", label: "قيد التجهيز", tone: "info" },
  { key: "SHIPPED", label: "تم الشحن", tone: "info" },
  { key: "DELIVERED", label: "تم التوصيل", tone: "success" },
  { key: "CANCELLED", label: "ملغي", tone: "destructive" },
  { key: "RETURNED", label: "مرتجع", tone: "neutral" },
]

const GOVERNORATES = [
  { value: "CAI", label: "القاهرة" },
  { value: "GIZ", label: "الجيزة" },
  { value: "ALX", label: "الإسكندرية" },
  { value: "ASW", label: "أسوان" },
]

const PRODUCTS = [
  {
    type: "آي سي",
    icon: Cpu,
    name: "معالج إنفينيون",
    identifier: "SAK-TC1797-512F180EF",
    meta: <Ltr>LQFP-176 · Infineon</Ltr>,
    price: 1850,
    compareAt: 2100,
    stock: STOCK[0],
    condition: null,
  },
  {
    type: "كنترول",
    icon: CircuitBoard,
    name: "كنترول بوش EDC17C46",
    identifier: "0281 018 758",
    meta: (
      <>
        فولكس فاجن · <Ltr>2.0 TDI</Ltr>
      </>
    ),
    price: 6500,
    compareAt: null,
    stock: STOCK[1],
    condition: CONDITION[1],
  },
  {
    type: "جهاز برمجة",
    icon: Usb,
    name: "جهاز KESS V3 ماستر",
    identifier: "KESS V3",
    meta: <Ltr>OBD · Boot · Bench</Ltr>,
    price: 24999.5,
    compareAt: null,
    stock: STOCK[2],
    condition: null,
  },
]

const SUPPORT = [
  { platform: "EDC17C46", obd: true, boot: true, bench: false },
  { platform: "MED17.5", obd: true, boot: false, bench: true },
  { platform: "SIMOS 18.1", obd: false, boot: true, bench: true },
]

// ── Page ───────────────────────────────────────────────────────

export function Showcase() {
  const [dark, setDark] = useState(false)

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl leading-tight font-bold">كنترول سيف زون</h1>
            <p className="text-sm text-muted-foreground">
              نظام التصميم — الألوان والخطوط والمكوّنات
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={toggleTheme}>
          {dark ? <Sun data-icon="inline-start" /> : <Moon data-icon="inline-start" />}
          {dark ? "الوضع الفاتح" : "الوضع الداكن"}
        </Button>
      </header>

      {/* ── Colour ── */}
      <Section title="الألوان" description="درجات الأحمر الفاتح للعلامة، ثم الألوان الدلالية.">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-11">
          {BRAND_SCALE.map(([step, hex]) => (
            <div key={step} className="flex flex-col gap-1.5">
              <div
                className="aspect-square rounded-lg ring-1 ring-foreground/10"
                style={{ background: `var(--brand-${step})` }}
              />
              <div className="flex flex-col text-xs leading-tight">
                <span className="font-semibold">
                  {step}
                  {step === "500" && <span className="text-primary-ink"> · أساسي</span>}
                </span>
                <Ltr mono className="text-muted-foreground">
                  {hex}
                </Ltr>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SEMANTIC.map((token) => (
            <div
              key={token.name}
              className={`flex h-20 flex-col justify-between rounded-xl p-3 text-sm ${token.className}`}
            >
              <span className="font-semibold">{token.label}</span>
              <Ltr mono className="text-xs opacity-80">
                --{token.name}
              </Ltr>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Type ── */}
      <Section
        title="الخطوط"
        description="IBM Plex Sans Arabic للعربي واللاتيني معًا، وIBM Plex Mono للأرقام التقنية."
      >
        <Card>
          <CardContent className="flex flex-col gap-4">
            <p className="text-4xl leading-tight font-bold">ابحث برقم القطعة</p>
            <p className="text-2xl leading-snug font-semibold">كنترولات بوش ودلفي وكونتيننتال</p>
            <p className="text-lg font-medium">آي سيهات، كنترولات، أجهزة برمجة وبن أوت</p>
            <p className="max-w-prose text-base text-muted-foreground">
              المعالج <Ltr>TC1797</Ltr> موجود على كنترول <Ltr>EDC17C46</Ltr> — اكتب الرقم كما
              هو مطبوع على القطعة، والبحث يتجاهل المسافات والشرطات والنقاط.
            </p>
            <Separator />
            <dl className="grid gap-2 text-sm sm:grid-cols-3">
              <SpecRow label="رقم الهاردوير" value="0281 018 758" />
              <SpecRow label="رقم السوفتوير" value="1037 541 778" />
              <SpecRow label="رقم الطلب" value="CSZ-2026-0001" />
            </dl>
          </CardContent>
        </Card>
      </Section>

      {/* ── Buttons ── */}
      <Section title="الأزرار" description="الأساسي للإجراء الرئيسي فقط — زر واحد أحمر في كل شاشة.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <ShoppingCart data-icon="inline-start" />
            أضف إلى السلة
          </Button>
          <Button variant="soft">
            <FileText data-icon="inline-start" />
            تحميل البن أوت
          </Button>
          <Button variant="outline">
            <Filter data-icon="inline-start" />
            تصفية
          </Button>
          <Button variant="secondary">المزيد</Button>
          <Button variant="ghost">إلغاء</Button>
          <Button variant="destructive">
            <Trash2 data-icon="inline-start" />
            حذف من السلة
          </Button>
          <Button variant="link">سياسة الاسترجاع</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xs">صغير جدًا</Button>
          <Button size="sm">صغير</Button>
          <Button>عادي</Button>
          <Button size="lg">كبير</Button>
          <Button size="xl">
            <Truck data-icon="inline-start" />
            إتمام الطلب
          </Button>
          <Button size="icon" variant="outline" aria-label="إضافة">
            <Plus />
          </Button>
          <Button disabled>غير متاح</Button>
        </div>
      </Section>

      {/* ── Status ── */}
      <Section
        title="الحالات"
        description="كل حالة لها لون ثابت ونقطة، فلا يعتمد المعنى على اللون وحده."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <StatusGroup title="المخزون" items={STOCK} />
          <StatusGroup title="حالة الكنترول" items={CONDITION} />
          <StatusGroup title="حالة الطلب" items={ORDER_STATUS} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>جديد في المتجر</Badge>
          <Badge variant="secondary">EDC17</Badge>
          <Badge variant="outline">OBD</Badge>
          <Badge variant="destructive">فشل الدفع</Badge>
        </div>
      </Section>

      {/* ── Product cards ── */}
      <Section
        title="بطاقات المنتجات"
        description="بطاقة واحدة لكل الأنواع — لا تفرّع حسب النوع، البيانات تأتي من PRODUCT_TYPE_META."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((product) => (
            <ProductCardSample key={product.identifier} product={product} />
          ))}
          <Card>
            <Skeleton className="mx-(--card-spacing) aspect-4/3 rounded-lg" />
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="mt-2 h-6 w-1/3" />
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ── Forms ── */}
      <Section title="النماذج" description="نموذج عنوان الشحن — المحافظة، ثم المدينة، ثم العنوان.">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>عنوان الشحن</CardTitle>
              <CardDescription>رسوم الشحن تُحسب حسب المحافظة.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="relative">
                <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="ps-8" placeholder="ابحث برقم القطعة أو الماركة…" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="اسم المستلم" htmlFor="ds-name">
                  <Input id="ds-name" placeholder="محمد أحمد" />
                </Field>
                <Field label="رقم الموبايل" htmlFor="ds-phone">
                  <div className="relative">
                    <Phone className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    {/* The input is dir="ltr", so its *end* is the right side — where the
                        icon sits in the RTL wrapper. */}
                    <Input id="ds-phone" dir="ltr" className="pe-8 text-end" placeholder="01012345678" />
                  </div>
                </Field>
              </div>
              <Field label="المحافظة">
                <Select items={GOVERNORATES} defaultValue="CAI">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOVERNORATES.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="علامة مميزة" htmlFor="ds-landmark">
                <Textarea id="ds-landmark" placeholder="بجوار صيدلية…" />
              </Field>
              <Field label="رقم الموبايل (خطأ)" htmlFor="ds-phone-err">
                <Input id="ds-phone-err" dir="ltr" className="text-end" defaultValue="0123" aria-invalid />
                <p className="text-sm text-destructive">رقم الموبايل يجب أن يكون 11 رقمًا ويبدأ بـ 01</p>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>طريقة الدفع</CardTitle>
              <CardDescription>ادفع أونلاين أو عند الاستلام.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <RadioGroup defaultValue="COD" className="gap-3">
                {[
                  { value: "CARD", label: "بطاقة بنكية / ميزة" },
                  { value: "WALLET", label: "محفظة موبايل — فودافون كاش" },
                  { value: "COD", label: "الدفع عند الاستلام" },
                ].map((m) => (
                  <Label
                    key={m.value}
                    className="rounded-lg border p-3 has-data-checked:border-primary has-data-checked:bg-primary-soft"
                  >
                    <RadioGroupItem value={m.value} />
                    {m.label}
                  </Label>
                ))}
              </RadioGroup>
              <Separator />
              <Label>
                <Checkbox defaultChecked />
                المتوفر فقط
              </Label>
              <Label>
                <Switch defaultChecked />
                إرسال التحديثات على واتساب
              </Label>
              <Separator />
              <dl className="flex flex-col gap-2 text-sm">
                <SummaryRow label="المجموع الفرعي" value={<Price amount={8350} size="sm" />} />
                <SummaryRow label="الشحن — القاهرة" value={<Price amount={60} size="sm" />} />
                <Separator />
                <SummaryRow label="الإجمالي" value={<Price amount={8410} size="lg" />} />
              </dl>
            </CardContent>
            <CardFooter>
              <Button size="xl" className="w-full">
                تأكيد الطلب
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      {/* ── Alerts ── */}
      <Section title="التنبيهات">
        <div className="grid gap-3 lg:grid-cols-2">
          <Alert>
            <Info />
            <AlertTitle>الدفع عند الاستلام متاح</AlertTitle>
            <AlertDescription>سنتصل بك على واتساب لتأكيد الطلب قبل الشحن.</AlertDescription>
          </Alert>
          <Alert className="border-warning/40 bg-warning-soft text-warning-ink">
            <TriangleAlert />
            <AlertTitle>متبقي قطعتان فقط</AlertTitle>
            <AlertDescription className="text-warning-ink/90">
              الكمية لا تُحجز في السلة — تُحجز عند إتمام الطلب.
            </AlertDescription>
          </Alert>
          <Alert className="border-success/30 bg-success-soft text-success">
            <Check />
            <AlertTitle>تم استلام طلبك</AlertTitle>
            <AlertDescription className="text-success/90">
              رقم الطلب <Ltr mono>CSZ-2026-0001</Ltr>
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <X />
            <AlertTitle>فشل الدفع</AlertTitle>
            <AlertDescription>لم يتم خصم أي مبلغ. جرّب مرة أخرى أو اختر الدفع عند الاستلام.</AlertDescription>
          </Alert>
        </div>
      </Section>

      {/* ── Navigation & data ── */}
      <Section title="التنقل والجداول">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">الرئيسية</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">الكنترولات</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <Ltr>EDC17C46</Ltr>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Tabs defaultValue="support">
          <TabsList>
            <TabsTrigger value="support">أجهزة تدعم هذا الكنترول</TabsTrigger>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
          </TabsList>
          <TabsContent value="support">
            <Card className="py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنصة</TableHead>
                    <TableHead className="text-center">OBD</TableHead>
                    <TableHead className="text-center">Boot</TableHead>
                    <TableHead className="text-center">Bench</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SUPPORT.map((row) => (
                    <TableRow key={row.platform}>
                      <TableCell className="font-medium">
                        <Ltr>{row.platform}</Ltr>
                      </TableCell>
                      {[row.obd, row.boot, row.bench].map((on, i) => (
                        <TableCell key={i} className="text-center">
                          {on ? (
                            <Check className="mx-auto size-4 text-success" aria-label="مدعوم" />
                          ) : (
                            <Minus className="mx-auto size-4 text-muted-foreground" aria-label="غير مدعوم" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          <TabsContent value="orders">
            <Card className="py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>المحافظة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-end">الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ORDER_STATUS.slice(1, 6).map((s, i) => (
                    <TableRow key={s.key}>
                      <TableCell>
                        <Ltr mono>{`CSZ-2026-000${i + 1}`}</Ltr>
                      </TableCell>
                      <TableCell>{GOVERNORATES[i % GOVERNORATES.length].label}</TableCell>
                      <TableCell>
                        <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                      </TableCell>
                      <TableCell className="text-end">
                        <Price amount={1250 * (i + 1)} size="sm" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" text="السابق" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" text="التالي" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Section>

      {/* ── Overlays ── */}
      <Section
        title="النوافذ والقوائم"
        description="السلة تُفتح من جهة البداية — اليمين في الواجهة العربية."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Sheet>
            <SheetTrigger render={<Button variant="outline" />}>
              <ShoppingCart data-icon="inline-start" />
              السلة (2)
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>سلة المشتريات</SheetTitle>
                <SheetDescription>قطعتان — الكمية تُحجز عند إتمام الطلب.</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-3 px-4">
                {PRODUCTS.slice(0, 2).map((p) => (
                  <div key={p.identifier} className="flex items-center gap-3 rounded-lg border p-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-muted">
                      <p.icon className="size-5 text-muted-foreground" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col text-sm">
                      <span className="truncate font-medium">{p.name}</span>
                      <Ltr mono className="text-xs text-muted-foreground">
                        {p.identifier}
                      </Ltr>
                    </div>
                    <Price amount={p.price} size="sm" />
                  </div>
                ))}
              </div>
              <SheetFooter>
                <Button size="xl">إتمام الطلب</Button>
                <SheetClose render={<Button variant="ghost" />}>متابعة التسوق</SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Dialog>
            <DialogTrigger render={<Button variant="destructive" />}>
              <Trash2 data-icon="inline-start" />
              حذف المنتج
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>حذف المنتج من السلة؟</DialogTitle>
                <DialogDescription>
                  سيتم حذف <Ltr>KESS V3</Ltr> من السلة. يمكنك إضافته مرة أخرى في أي وقت.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>إلغاء</DialogClose>
                <DialogClose render={<Button variant="destructive" />}>
                  <Trash2 data-icon="inline-start" />
                  حذف
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2 px-1.5" />}>
              <Avatar className="size-6">
                <AvatarFallback>م</AvatarFallback>
              </Avatar>
              حسابي
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
                <DropdownMenuLabel>ورشة الأمل للإلكترونيات</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Package />
                  طلباتي
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User />
                  العناوين
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings />
                  الإعدادات
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <LogOut />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger render={<Button variant="outline" size="icon" aria-label="المزيد" />}>
              <Ellipsis />
            </TooltipTrigger>
            <TooltipContent>خيارات إضافية</TooltipContent>
          </Tooltip>

          <Button
            variant="soft"
            onClick={() =>
              toast.success("تمت الإضافة إلى السلة", {
                description: "كنترول بوش EDC17C46",
              })
            }
          >
            عرض إشعار
          </Button>
        </div>
      </Section>
    </div>
  )
}

// ── Local helpers ─────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 border-s-4 border-primary ps-3">
        <h2 className="text-xl leading-tight font-bold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function StatusGroup({ title, items }: { title: string; items: { label: string; tone: StatusTone }[] }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {items.map((item) => (
          <StatusBadge key={item.label} tone={item.tone}>
            {item.label}
          </StatusBadge>
        ))}
      </CardContent>
    </Card>
  )
}

function ProductCardSample({ product }: { product: (typeof PRODUCTS)[number] }) {
  const outOfStock = product.stock.tone === "neutral"
  const Icon = product.icon

  return (
    <Card className="pt-0">
      <div className="relative grid aspect-4/3 place-items-center bg-muted">
        <Icon className="size-12 text-muted-foreground/60" strokeWidth={1.25} />
        <Badge variant="secondary" className="absolute start-3 top-3">
          {product.type}
        </Badge>
        {product.compareAt && (
          <Badge className="absolute end-3 top-3">خصم</Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{product.name}</CardTitle>
        <CardDescription className="flex flex-col gap-0.5">
          <Ltr mono className="text-foreground">
            {product.identifier}
          </Ltr>
          <span>{product.meta}</span>
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="المواصفات">
            <Info />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-1.5">
        <StatusBadge tone={product.stock.tone}>{product.stock.label}</StatusBadge>
        {product.condition && (
          <StatusBadge tone={product.condition.tone}>{product.condition.label}</StatusBadge>
        )}
      </CardContent>
      <CardContent className="mt-auto flex items-center justify-between gap-2">
        <Price amount={product.price} compareAt={product.compareAt} />
        <Button disabled={outOfStock} aria-label="أضف إلى السلة" size="icon">
          <ShoppingCart />
        </Button>
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">
        <Ltr mono>{value}</Ltr>
      </dd>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
