"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import MDEditor from "@uiw/react-md-editor";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import { toast } from "sonner";

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
import {
  createNews,
  NewsFormValues,
  updateNews,
} from "@/lib/actions/news.action";
import { NewsSchema } from "@/lib/validation";

import Preview from "../editor/Preview";

interface NewsFormProps {
  initialData?: NewsFormValues & { id?: number };
}

export default function NewsForm({ initialData }: NewsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(NewsSchema),
    defaultValues: initialData || {
      title: "",
      slug: "",
      mainImage: "",
      content: "",
    },
  });

  const onSubmit = async (values: NewsFormValues) => {
    setIsSubmitting(true);

    try {
      const result = initialData?.id
        ? await updateNews(initialData.id, values)
        : await createNews(values);

      if (result.error) {
        // Handle validation errors
        const errors = result.error as FormErrors;

        if (errors._form) {
          toast("Something went wrong. Please try again.", {
            description: errors._form[0],
          });
        }

        Object.entries(errors).forEach(([key, messages]) => {
          if (key !== "_form" && messages && messages.length > 0) {
            form.setError(key as keyof NewsFormValues, {
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

      // Reset form if creating a new post
      if (!initialData) {
        form.reset({
          title: "",
          slug: "",
          mainImage: "",
          content: "",
        });
      } else {
        // Small delay to ensure the refresh is processed before navigation
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
    <div className="flex gap-2 ">
      <div className="space-y-3 pt-4 sticky h-screen top-0 flex-1 max-w-xl">
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
                <FormItem className="col-span-full">
                  <FormLabel>Main Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
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
