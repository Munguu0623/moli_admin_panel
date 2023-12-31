import { NextPage } from "next";

import React, { useState } from "react";
import { Button, Form, Input, Select, Tag } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import MarkdownRenderer from "../components/markdown-render";
import { Notif } from "../components/notification";
import { getSortedPostsData } from "@/pages/lib/posts";
import HomeLayout from "../components/Layout";
import Editor from "../components/common/Editor";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { IBlog } from "@/utils/types";
const formSchema = z.object({
  title: z
    .string({
      required_error: "Гарчиг оруулна уу",
    })
    .max(50),
  description: z.string(),
  published: z.boolean(),
});

type TProps = {
  data: {
    posts: IBlog;
    allPostsData: {
      content: string; // Add this line to specify the type of 'content'
    }[];
    // post?: Post | null;
  };
};

const CreatePost: NextPage<TProps> = ({ data: allPostsData, data: posts }) => {
  const [type, setType] = useState("");
  // const [body, setBody] = useState(post?.body || "");
  const firstPostContent = allPostsData.allPostsData[0].content; // how to fix this is error Property 'content' does not exist on type 'string'?
  console.log(type + "type");

  // form beltgej baina
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: (posts && posts.posts && posts.posts.BlodTitle) || "",
      description: (posts && posts.posts && posts.posts.BlogDescription) || "",
    },
  });

  // const submitBlog = () => {
  //   type == ""
  //     ? Notif("Анхаар", "Та нийтлэх төрөл сонгоогүй байна!!!", "warning")
  //     : "";
  // };
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    const finalValues = {
      ...values,
      publishedAt: values.published ? new Date() : null,
    };

    if (posts) {
      fetch("/api/user/post", {
        method: "POST",
        body: JSON.stringify(finalValues),
      })
        .then((res) => res.json())
        .then(({ post, error }) => {
          Notif("Амжилттай", "Амжилттай хадгаллаа!!!", "success");

          if (error) {
            throw new Error(error.message);
          }
        })
        .catch((error) => {
          console.log(error.message);
          Notif("Амжилттай", "Илгээхэд алдаа гарсан!!!", "error");
        });
    }
  }

  return (
    <HomeLayout>
      <div>
        <Form
          {...form}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          layout="horizontal"
          size="large"
          style={{ maxWidth: 1000 }}
        >
          <Form.Item>
            <Button
              type="primary"
              className="bg-blue-500"
              onClick={form.handleSubmit(onSubmit)}
            >
              Нийтлэх
            </Button>
          </Form.Item>
          <Form.Item label="Төрөл">
            <Select
              onChange={(value) => {
                console.log("Selected value:", value);
                setType(value);
                console.log("Type state:", type);
              }}
            >
              <Select.Option value="blog">Нийтлэл & Влог</Select.Option>
              <Select.Option value="profession">Мэргэжил</Select.Option>
            </Select>
            <p className=" text-slate-500">
              Нийтлэл үү? эсвэл мэргэжилийн танилцуулга уу та сонгоно уу?
            </p>
          </Form.Item>

          <Form.Item label="Гарчиг">
            <Input />
            <p className=" text-slate-500">
              Гарчиг ойлгомжтой, товч, тодорхой байх хэрэгтэй
            </p>
          </Form.Item>

          {type == "profession" ? (
            <Form.Item label="Категори">
              <Select>
                <Select.Option value="blog">Хүмүүнлэг</Select.Option>
                <Select.Option value="medical">Ангаах</Select.Option>
                <Select.Option value="tech">Мэдээлэл технологи</Select.Option>
                <Select.Option value="eng">Инженер</Select.Option>
              </Select>

              <Tag
                icon={<ExclamationCircleOutlined />}
                color="warning"
                className="mt-4"
              >
                Та мэргэжилийн талаар мэдээлэл оруулах гэж байгаа бол доорх
                форматын дагуу бичнэ үү?
                <MarkdownRenderer
                  content={firstPostContent}
                  className="prose prose-sm  text-[0.60rem] "
                />
                {/* <Markdown class="prose prose-sm text-orange-400">
                  {firstPostContent}
                </Markdown> */}
              </Tag>
            </Form.Item>
          ) : (
            <></>
          )}
        </Form>
        <Editor />
      </div>
    </HomeLayout>
  );
};

export default CreatePost;

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  console.log(allPostsData + "allPosts");
  return {
    props: {
      data: {
        allPostsData,
      },
    },
  };
}
