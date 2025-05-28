/* eslint-disable @next/next/no-img-element */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import MDEditor from "@uiw/react-md-editor";
import { Check, Copy, Trash2, Eye, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { toast } from "sonner";
import type * as z from "zod";

import { NewsPreview } from "@/components/editor/Preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useNewsRefresh } from "@/contexts/NewsRefreshContext";
import {
  createNews,
  updateNews,
  updateNewsImages,
} from "@/lib/actions/news.action";
import { deleteFile } from "@/lib/actions/uploadthing.action";
import { extractIdentifierFromUrl } from "@/lib/utils";
import { UploadButton } from "@/lib/utils/uploadthing";
import { NewsSchema } from "@/lib/validation";

import { SidebarTrigger } from "../ui/sidebar";

interface NewsFormProps {
  initialData?: z.infer<typeof NewsSchema> & { id: number };
}

interface FormErrors {
  [key: string]: string[];
}

export default function NewsForm({ initialData }: NewsFormProps) {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);
  const { triggerRefresh } = useNewsRefresh();
  const [deleteTransition, startDeleteTransition] = useTransition();
  const [copiedStatus, setCopiedStatus] = useState<Record<number, boolean>>({});

  const form = useForm<z.infer<typeof NewsSchema>>({
    resolver: zodResolver(NewsSchema),
    defaultValues: initialData || {
      title: "",
      slug: "",
      mainImage: "",
      content: "",
      images: [],
    },
  });

  useEffect(() => {
    if (initialData?.images) {
      form.setValue("images", initialData.images);
    }
  }, [initialData?.images, form]);

  const onSubmit = async (values: z.infer<typeof NewsSchema>) => {
    try {
      const result = initialData?.id
        ? await updateNews(initialData.id, values)
        : await createNews(values);

      if (result.error) {
        const errors = result.error as FormErrors;

        if (errors._form) {
          toast.error("Coś poszło nie tak. Spróbuj ponownie.", {
            description: errors._form[0],
          });
        }

        throw new Error("Coś poszło nie tak. Spróbuj ponownie.");
      }

      toast.success(
        initialData
          ? "Artykuł został zaktualizowany"
          : "Artykuł został stworzony"
      );

      if (!initialData) {
        form.reset({
          title: "",
          slug: "",
          mainImage: "",
          content: "",
          images: [],
        });
        triggerRefresh();
      } else {
        triggerRefresh();
        await new Promise((resolve) => setTimeout(resolve, 200));
        router.push("/studio");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Coś poszło nie tak. Spróbuj ponownie."
      );
    }
  };

  const generateSlug = () => {
    const title = form.getValues("title");
    if (title) {
      const slug = slugify(title, { lower: true, strict: true });
      form.setValue("slug", slug);
    }
  };

  const handleUpdateImages = async () => {
    if (!initialData) return;
    const result = await updateNewsImages({
      id: initialData.id,
      images: form.getValues("images"),
    });

    if (result.error) {
      toast.error("Coś poszło nie tak. Spróbuj ponownie.");
      throw new Error("Coś poszło nie tak. Spróbuj ponownie.");
    }

    toast.success("Obrazki zostały zaktualizowane");
  };

  const handleCopy = (textToCopy: string, index: number) => {
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setCopiedStatus({ ...copiedStatus, [index]: true });
        toast.success("Link został skopiowany!");
        setTimeout(() => {
          setCopiedStatus({ ...copiedStatus, [index]: false });
        }, 2000);
      },
      (err) => {
        console.error("Nie udało się skopiować linku: ", err);
        toast.error("Nie udało się skopiować linku.");
      }
    );
  };

  const removeImage = (index: number) => {
    startDeleteTransition(async () => {
      const imageUrlToDelete = form.watch("images")[index];
      const fileKey = extractIdentifierFromUrl(imageUrlToDelete);
      if (fileKey) {
        try {
          await deleteFile(fileKey);
        } catch (error) {
          console.warn("Nie udało się usunąć pliku z chmury:", error);
        }
      }
      const updatedImages = form.watch("images").filter((_, i) => i !== index);
      form.setValue("images", updatedImages, { shouldValidate: true });
      if (initialData) {
        handleUpdateImages();
      }
    });
  };

  return (
    <>
      <div className="flex sticky top-0 z-10 items-center bg-background/90 p-4 border-b">
        <SidebarTrigger />
        <div className="flex justify-between w-full items-center">
          <h1 className="text-xl font-semibold">
            {initialData ? "Edycja artykułu" : "Tworzenie artykułu"}
            {showPreview && " (Podgląd)"}
          </h1>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview((prev) => !prev)}
              className="gap-2"
            >
              {showPreview ? (
                <>
                  <X className="h-4 w-4" />
                  Zamknij podgląd
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" /> Podgląd
                </>
              )}
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              onClick={form.handleSubmit(onSubmit)}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {form.formState.isSubmitting
                ? "Saving..."
                : initialData
                  ? "Zapisz zmiany"
                  : "Stwórz artykuł"}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 gap-5 overflow-hidden flex items-center xl:items-start xl:justify-center flex-col xl:flex-row">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col overflow-auto h-full flex-1 w-full max-w-4xl gap-2"
          >
            <Card className="gap-3">
              <CardHeader>
                <CardTitle>Informacje podstawowe</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tytuł</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Wpisz tytuł artykułu..."
                          {...field}
                          onBlur={() => {
                            field.onBlur();
                            if (!form.getValues("slug")) {
                              generateSlug();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input placeholder="np. " {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateSlug}
                        >
                          Generuj
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="gap-3">
              <CardHeader>
                <CardTitle>Główne zdjęcie</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="mainImage"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex flex-col gap-2">
                        {field.value && (
                          <div className="relative">
                            <img
                              src={field.value || "/placeholder.svg"}
                              alt="Main image preview"
                              className="w-full h-48 object-cover rounded-lg border"
                            />
                          </div>
                        )}

                        <FormControl>
                          <Input
                            placeholder="Wpisz link do obrazka"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="gap-3">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Zdjęcia</span>
                  <Badge variant="secondary">
                    {form.watch("images").length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="images"
                  render={() => (
                    <FormItem>
                      <div className="flex flex-col gap-2">
                        {form.watch("images").map((image, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 border rounded-lg"
                          >
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Preview ${index + 1}`}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <Input
                              value={image}
                              readOnly
                              className="bg-muted/50 flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleCopy(image, index)}
                            >
                              {copiedStatus[index] ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              disabled={deleteTransition}
                              onClick={() => removeImage(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                        <UploadButton
                          appearance={{
                            button:
                              "ut-ready:bg-primary ut-uploading:cursor-not-allowed text-primary-foreground w-full",
                            allowedContent: "hidden",
                          }}
                          endpoint="imageUploader"
                          onClientUploadComplete={(res) => {
                            if (res) {
                              const newImageUrl = res[0].ufsUrl;
                              if (!form.watch("images").includes(newImageUrl)) {
                                const updatedImages = [
                                  ...form.watch("images"),
                                  newImageUrl,
                                ];
                                form.setValue("images", updatedImages, {
                                  shouldValidate: true,
                                });
                                if (initialData) {
                                  handleUpdateImages();
                                }
                              }
                            }
                          }}
                          onUploadError={(error: Error) => {
                            toast.error(
                              `Nie udało się wysłać zdjęcia: ${error.message}`
                            );
                          }}
                        />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="gap-3">
              <CardHeader>
                <CardTitle>Kontent</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="content"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <div data-color-mode="light">
                          <MDEditor
                            value={form.watch("content")}
                            onChange={(value) =>
                              form.setValue("content", value as string)
                            }
                            preview="edit"
                            height={400}
                            style={{ borderRadius: 8, overflow: "hidden" }}
                            textareaProps={{
                              placeholder: "Write your article content...",
                            }}
                            previewOptions={{
                              disallowedElements: ["style"],
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset({
                    title: initialData?.title || "",
                    slug: initialData?.slug || "",
                    mainImage: initialData?.mainImage || "",
                    content: initialData?.content || "",
                    images: form.watch("images"),
                  });
                }}
                disabled={form.formState.isSubmitting}
              >
                Reset
              </Button>
            </div>
          </form>
        </Form>
        {showPreview && (
          <NewsPreview
            content={form.watch("content")}
            title={form.watch("title")}
            mainImage={form.watch("mainImage")}
          />
        )}
      </div>
    </>
  );
}
