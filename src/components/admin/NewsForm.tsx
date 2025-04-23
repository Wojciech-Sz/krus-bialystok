"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import MDEditor from "@uiw/react-md-editor";
import { Check, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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

import Preview from "../editor/Preview";

interface NewsFormProps {
  initialData?: z.infer<typeof NewsSchema> & { id: number };
}

interface FormErrors {
  [key: string]: string[];
}

export default function NewsForm({ initialData }: NewsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { triggerRefresh } = useNewsRefresh();
  const [deleteTransition, startDeleteTransition] = useTransition();
  const [copiedStatus, setCopiedStatus] = useState<Record<number, boolean>>({}); // State for copy feedback

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
    setIsSubmitting(true);
    try {
      const result = initialData?.id
        ? await updateNews(initialData.id, values)
        : await createNews(values);

      if (result.error) {
        const errors = result.error as FormErrors;

        if (errors._form) {
          toast.error("Coś poszło nie tak. Proszę spróbować ponownie.", {
            description: errors._form[0],
          });
        }

        Object.entries(errors).forEach(([key, messages]) => {
          if (key !== "_form" && messages && messages.length > 0) {
            form.setError(key as keyof z.infer<typeof NewsSchema>, {
              type: "manual",
              message: messages[0],
            });
          }
        });

        throw new Error("Failed to create/update news");
      }

      toast.success(
        <div>
          <p>
            {initialData
              ? "Post zaktualizowany pomyślnie"
              : "Post utworzony pomyślnie"}
          </p>
        </div>
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
        <div>
          <p>Coś poszło nie tak. Proszę spróbować ponownie.</p>
          <p className="text-muted-foreground">{String(error)}</p>
        </div>
      );
    } finally {
      setIsSubmitting(false);
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
      const errors = result.error as FormErrors;

      if (errors._form) {
        toast.error("Coś poszło nie tak. Proszę spróbować ponownie.", {
          description: errors._form[0],
        });
      }

      Object.entries(errors).forEach(([key, messages]) => {
        if (key !== "_form" && messages && messages.length > 0) {
          form.setError(key as keyof z.infer<typeof NewsSchema>, {
            type: "manual",
            message: messages[0],
          });
        }
      });

      throw new Error("Failed to update news images");
    }

    toast.success("Zdjęcia zaktualizowane pomyślnie");
  };

  // Function to handle copying
  const handleCopy = (textToCopy: string, index: number) => {
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setCopiedStatus({ ...copiedStatus, [index]: true });
        toast.success("Link skopiowany do schowka!");
        setTimeout(() => {
          setCopiedStatus({ ...copiedStatus, [index]: false });
        }, 2000); // Reset after 2 seconds
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast.error("Nie udało się skopiować linku.");
      }
    );
  };

  return (
    <div className="flex flex-1 items-center xl:items-start flex-col xl:flex-row gap-2">
      <div className="space-y-3 overflow-auto px-4 py-4 xl:sticky xl:h-screen flex-1 top-0 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">
            {initialData ? "Edytuj post" : "Utwórz post"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {initialData
              ? "Zaktualizuj informacje o swoim poście."
              : "Utwórz nowy post dla swojej strony internetowej."}
          </p>
        </div>
        <Separator />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tytuł</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Wprowadź tytuł..."
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
                      <Input placeholder="np. przykladowy-tytul" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateSlug}
                    >
                      Wygeneruj
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mainImage"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Główne zdjęcie</FormLabel>
                  <div className="flex gap-2 items-center">
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        readOnly
                        className="bg-muted/50 cursor-default"
                        {...field}
                      />
                    </FormControl>
                    <UploadButton
                      appearance={{
                        button:
                          "ut-ready:bg-primary ut-uploading:cursor-not-allowed text-primary-foreground ",
                        allowedContent: "hidden",
                      }}
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        if (res) {
                          form.setValue("mainImage", res[0].ufsUrl);
                        }
                      }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="images"
              render={() => (
                <FormItem>
                  <FormLabel>Zdjęcia</FormLabel>
                  <div className="flex flex-col gap-2">
                    {form.watch("images").map((image, index) => (
                      <div
                        key={index}
                        className="flex w-full items-center gap-2 border p-2 rounded mb-2"
                      >
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              value={image}
                              readOnly
                              className="bg-muted/50 cursor-default" // Slightly different bg for readOnly
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                        {/* Copy Button */}
                        <Button
                          type="button" // Prevent form submission
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(image, index)}
                          className="shrink-0"
                        >
                          {copiedStatus[index] ? (
                            <Check className="text-green-500" />
                          ) : (
                            <Copy />
                          )}
                        </Button>
                        {image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image}
                            width={60}
                            height={60}
                            loading="lazy"
                            alt={`Preview ${index + 1}`}
                            className="object-cover rounded aspect-square"
                          />
                        )}
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            type="button"
                            disabled={deleteTransition}
                            onClick={async () => {
                              startDeleteTransition(async () => {
                                const imageUrlToDelete = image;
                                const fileKey =
                                  extractIdentifierFromUrl(imageUrlToDelete);
                                if (fileKey) {
                                  try {
                                    await deleteFile(fileKey);
                                  } catch (error) {
                                    console.warn(
                                      "Failed to delete file from storage:",
                                      error
                                    );
                                  }
                                }
                                const updatedImages = form
                                  .watch("images")
                                  .filter((_, i) => i !== index);
                                form.setValue("images", updatedImages, {
                                  shouldValidate: true,
                                });
                                handleUpdateImages();
                              });
                            }}
                          >
                            {deleteTransition ? "Usuwanie..." : "Usuń z chmury"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            type="button"
                            onClick={() => {
                              const updatedImages = form
                                .watch("images")
                                .filter((_, i) => i !== index);
                              form.setValue("images", updatedImages, {
                                shouldValidate: true,
                              });
                            }}
                          >
                            Usuń z bazy danych
                          </Button>
                        </div>
                      </div>
                    ))}

                    <UploadButton
                      appearance={{
                        button:
                          "ut-ready:bg-primary ut-uploading:cursor-not-allowed text-primary-foreground ",
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
                          }
                          handleUpdateImages();
                        }
                      }}
                      onUploadError={(error: Error) => {
                        alert(`ERROR! ${error.message}`);
                      }}
                    />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={() => (
                <FormItem>
                  <FormLabel>Treść</FormLabel>
                  <FormControl>
                    <div data-color-mode="light">
                      <MDEditor
                        value={form.watch("content")}
                        onChange={(value) =>
                          form.setValue("content", value as string)
                        }
                        id={"content"}
                        preview={"edit"}
                        height={300}
                        style={{ borderRadius: 10, overflow: "hidden" }}
                        textareaProps={{
                          placeholder: "Wprowadź treść posta...",
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
            <div className="flex justify-end gap-4">
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
                disabled={isSubmitting}
              >
                Anuluj
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Zapisywanie..."
                  : initialData
                    ? "Zapisz zmiany"
                    : "Utwórz post"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <Preview
        content={form.watch("content")}
        title={form.watch("title")}
        mainImage={form.watch("mainImage")}
      />
    </div>
  );
}
