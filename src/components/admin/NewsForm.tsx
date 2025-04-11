"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import MDEditor from "@uiw/react-md-editor";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { toast } from "sonner";
import { z } from "zod";

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
import { createNews, updateNews } from "@/lib/actions/news.action";
import { deleteFile } from "@/lib/actions/uploadthing.action";
import { extractIdentifierFromUrl } from "@/lib/utils";
import { UploadButton } from "@/lib/utils/uploadthing";
import { NewsSchema } from "@/lib/validation";

import Preview from "../editor/Preview";

interface NewsFormProps {
  initialData?: z.infer<typeof NewsSchema> & { id?: number };
}

interface FormErrors {
  [key: string]: string[];
}

export default function NewsForm({ initialData }: NewsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { triggerRefresh } = useNewsRefresh();
  const [images, setImages] = useState<string[]>([]);
  const [deleteTransition, startDeleteTransition] = useTransition();
  const [manualImageUrl, setManualImageUrl] = useState("");

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
      setImages(initialData.images);
      form.setValue("images", initialData.images);
    }
  }, [initialData?.images, form]);

  const handleAddManualUrl = () => {
    if (manualImageUrl && manualImageUrl.trim() !== "") {
      const newUrl = manualImageUrl.trim();
      if (!images.includes(newUrl)) {
        const updatedImages = [...images, newUrl];
        setImages(updatedImages);
        form.setValue("images", updatedImages, { shouldValidate: true });
        setManualImageUrl("");
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof NewsSchema>) => {
    setIsSubmitting(true);
    try {
      const result = initialData?.id
        ? await updateNews(initialData.id, values)
        : await createNews(values);

      if (result.error) {
        const errors = result.error as FormErrors;

        if (errors._form) {
          toast.error("Something went wrong. Please try again.", {
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
          <p>{initialData ? "News updated" : "News created"}</p>
          <p className="text-muted-foreground">
            {initialData
              ? "Your news post has been updated."
              : "Your news post has been created."}
          </p>
        </div>
      );

      if (!initialData) {
        setImages([]);
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
          <p>Something went wrong. Please try again.</p>
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

  return (
    <div className="flex flex-1 items-center xl:items-start flex-col xl:flex-row gap-2">
      <div className="space-y-3 overflow-auto px-4 py-4 xl:sticky xl:h-screen flex-1 top-0 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">
            {initialData ? "Edit News Post" : "Create News Post"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {initialData
              ? "Update your news post information."
              : "Create a new news post for your website."}
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
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="News title"
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
                      <Input placeholder="news-slug" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateSlug}
                    >
                      Generate
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
                  <FormLabel>Main Image URL</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <UploadButton
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
                  <FormLabel>Images</FormLabel>
                  <div className="flex flex-col gap-2">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="flex w-full items-end gap-2 border p-2 rounded mb-2"
                      >
                        <FormItem className="flex-grow h-full">
                          <FormLabel className="text-xs">
                            Image URL {index + 1}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              value={image}
                              onChange={(e) => {
                                const updatedImages = images.map((img, i) =>
                                  i === index ? e.target.value : img
                                );
                                setImages(updatedImages);
                                form.setValue("images", updatedImages, {
                                  shouldValidate: true,
                                });
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                        {image && (
                          <Image
                            src={image}
                            width={60}
                            height={60}
                            alt={`Preview ${index + 1}`}
                            className="object-cover rounded aspect-square"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.png";
                              e.currentTarget.onerror = null;
                            }}
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
                                const updatedImages = images.filter(
                                  (_, i) => i !== index
                                );
                                setImages(updatedImages);
                                form.setValue("images", updatedImages, {
                                  shouldValidate: true,
                                });
                              });
                            }}
                          >
                            Delete from cloud
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            type="button"
                            onClick={() => {
                              const updatedImages = images.filter(
                                (_, i) => i !== index
                              );
                              setImages(updatedImages);
                              form.setValue("images", updatedImages, {
                                shouldValidate: true,
                              });
                            }}
                          >
                            Delete from database
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-end gap-2 mt-4 border-t pt-4">
                      <FormItem className="flex-grow">
                        <FormLabel className="text-xs">
                          Add Image URL Manually
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://new-image.com/pic.jpg"
                            value={manualImageUrl}
                            onChange={(e) => setManualImageUrl(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddManualUrl();
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                      <Button
                        type="button"
                        onClick={handleAddManualUrl}
                        size="sm"
                      >
                        Add URL
                      </Button>
                    </div>

                    <div className="mt-4 border-t pt-4">
                      <FormLabel className="text-xs mb-2 block">
                        Or Upload Image
                      </FormLabel>
                      <UploadButton
                        appearance={{
                          button:
                            "ut-ready:bg-green-500 ut-uploading:cursor-not-allowed bg-primary text-primary-foreground after:bg-primary",
                          allowedContent: "hidden",
                        }}
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (res) {
                            const newImageUrl = res[0].ufsUrl;
                            if (!images.includes(newImageUrl)) {
                              const updatedImages = [...images, newImageUrl];
                              setImages(updatedImages);
                              form.setValue("images", updatedImages, {
                                shouldValidate: true,
                              });
                            }
                          }
                        }}
                        onUploadError={(error: Error) => {
                          alert(`ERROR! ${error.message}`);
                        }}
                      />
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={() => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
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
                          placeholder: "Enter news content here...",
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
                  form.reset();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update News"
                    : "Create News"}
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
