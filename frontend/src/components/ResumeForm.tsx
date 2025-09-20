import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, X, Sparkles, Loader2 } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "react-hot-toast";

// Format date for display
const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getFullYear()}`;
};

// Schema for entry validation
const entrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  organization: z.string().min(1, "Organization is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().min(1, "Description is required"),
});

export default function ResumeForm({ entries = [], onChange, defaultEntry, title }) {
  const [isAdding, setIsAdding] = useState(false);
  const [current, setCurrent] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: defaultEntry || {
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  });

  const handleValidation = (callback) => {
    return handleSubmit((data) => {
      callback(data);
    });
  };

  const handleAdd = handleValidation((data) => {
    const formattedEntry = {
      ...data,
      startDate: formatDisplayDate(data.startDate),
      endDate: data.current ? "" : formatDisplayDate(data.endDate),
    };

    onChange([...entries, formattedEntry]);

    reset();
    setIsAdding(false);
  });

  // const handleEdit = (index, data) => {
  //   const updatedEntries = [...entries];
  //   updatedEntries[index] = {
  //     ...data,
  //     startDate: formatDisplayDate(data.startDate),
  //     endDate: data.current ? "" : formatDisplayDate(data.endDate),
  //   };
  //   onChange(updatedEntries);
  // };

  const handleDelete = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onChange(newEntries);
  };

  const handleImproveDescription = async () => {
    const description = watch("description");
    if (!description) {
      toast.error("Please enter a description first");
      return;
    }

    setIsImproving(true);
    
    try {
      // Simulate AI improvement with a timeout
      // In a real app, you would call an API endpoint
      setTimeout(() => {
        const improved = description.trim() + 
          (description.endsWith(".") ? "" : ".") + 
          " Enhanced with additional detail showcasing achievements and key responsibilities.";
        
        setValue("description", improved);
        toast.success("Description improved successfully!");
        setIsImproving(false);
      }, 1500);
    } catch (error) {
      console.error("Error improving description:", error);
      toast.error("Failed to improve description");
      setIsImproving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {entries.map((item, index) => (
          <Card key={`entry-${item.title}-${item.organization}-${index}`} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                {item.title} @ {item.organization}
              </CardTitle>
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => handleDelete(index)}
                className="h-8 w-8 bg-slate-700/50 hover:bg-slate-600/50 border-slate-600/50 hover:border-slate-500/50"
              >
                <X className="h-4 w-4 text-slate-300" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                {item.current
                  ? `${item.startDate} - Present`
                  : `${item.startDate} - ${item.endDate}`}
              </p>
              <p className="mt-2 text-sm whitespace-pre-wrap text-slate-300">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isAdding && (
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-200">Add {title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="Title/Position"
                  {...register("title")}
                  className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                />
                {errors.title && (
                  <p className="text-sm text-red-400">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Organization/Company"
                  {...register("organization")}
                  className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                />
                {errors.organization && (
                  <p className="text-sm text-red-400">
                    {errors.organization.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  type="month"
                  {...register("startDate")}
                  className="bg-slate-700/50 border-slate-600/50 text-slate-200 focus:border-cyan-400 focus:ring-cyan-400/20"
                />
                {errors.startDate && (
                  <p className="text-sm text-red-400">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  type="month"
                  {...register("endDate")}
                  disabled={current}
                  className="bg-slate-700/50 border-slate-600/50 text-slate-200 focus:border-cyan-400 focus:ring-cyan-400/20 disabled:opacity-50"
                />
                {errors.endDate && (
                  <p className="text-sm text-red-400">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="current"
                {...register("current")}
                onChange={(e) => {
                  setValue("current", e.target.checked);
                  setCurrent(e.target.checked);
                  if (e.target.checked) {
                    setValue("endDate", "");
                  }
                }}
                className="text-cyan-400 focus:ring-cyan-400/20"
              />
              <label htmlFor="current" className="text-slate-200">Current {title}</label>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder={`Description of your ${title.toLowerCase()}`}
                className="h-32 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleImproveDescription}
              disabled={isImproving || !watch("description")}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-700/50"
            >
              {isImproving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Improving...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Improve with AI
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setIsAdding(false);
              }}
              className="bg-slate-700/50 hover:bg-slate-600/50 border-slate-600/50 text-slate-200"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleAdd}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </CardFooter>
        </Card>
      )}

      {!isAdding && (
        <Button
          className="w-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 border border-slate-700/50 hover:border-slate-600/50"
          variant="outline"
          onClick={() => setIsAdding(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add {title}
        </Button>
      )}
    </div>
  );
}

