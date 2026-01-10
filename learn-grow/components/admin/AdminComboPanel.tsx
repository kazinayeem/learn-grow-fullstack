import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab,
  Button,
  Link,
  Divider,
  Badge,
  Spinner,
  Alert,
} from "@nextui-org/react";
import ComboManagement from "./ComboManagement";
import AccessDurationManager from "./AccessDurationManager";

export default function AdminComboPanel() {
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    {
      title: "Combo Management",
      description: "Create, edit, and manage course combos",
      icon: "📦",
      color: "primary",
      href: "/admin/combos",
    },
    {
      title: "Access Duration",
      description: "Manage student course access durations",
      icon: "⏱️",
      color: "success",
      href: "/admin/access-duration",
    },
    {
      title: "Student Access",
      description: "View and modify student access status",
      icon: "👥",
      color: "warning",
      href: "/admin/access-duration",
    },
    {
      title: "Orders",
      description: "View and manage student orders",
      icon: "📋",
      color: "secondary",
      href: "/admin/orders",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-default-500 mt-1">
          Manage course combos and student access durations
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <CardBody className="gap-3">
              <div className="text-4xl">{stat.icon}</div>
              <div>
                <h3 className="font-semibold text-foreground">{stat.title}</h3>
                <p className="text-sm text-default-500">{stat.description}</p>
              </div>
              <Button
                as={Link}
                href={stat.href}
                color="default"
                variant="light"
                size="sm"
                className="mt-auto"
              >
                Manage →
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Tabbed Content */}
      <Card>
        <CardBody className="p-0">
          <Tabs
            aria-label="Admin Options"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key.toString())}
            classNames={{
              tabList: "w-full rounded-none border-b bg-default-50",
              tab: "px-6 py-4",
              tabContent: "group-data-[selected=true]:text-primary font-semibold",
            }}
          >
            {/* Overview */}
            <Tab key="overview" title="Overview">
              <div className="py-8 space-y-6">
                <Alert
                  color="info"
                  title="Welcome to the Admin Dashboard"
                  description="Use the tabs below to access different management tools, or select from the quick action cards above."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Combo Management Info */}
                  <Card>
                    <CardHeader className="flex gap-3">
                      <div className="text-2xl">📦</div>
                      <div className="flex flex-col">
                        <p className="text-lg font-semibold">Combo Management</p>
                        <p className="text-sm text-default-500">
                          Create and manage course bundles
                        </p>
                      </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="gap-3">
                      <ul className="list-disc list-inside space-y-2 text-sm text-default-600">
                        <li>Create new course combos (1-3 courses)</li>
                        <li>Set flexible pricing and discounts</li>
                        <li>Configure access durations</li>
                        <li>Enable/disable combos</li>
                        <li>View combo details and course list</li>
                      </ul>
                      <Button
                        as={Link}
                        href="/admin/combos"
                        color="primary"
                        fullWidth
                      >
                        Go to Combo Management
                      </Button>
                    </CardBody>
                  </Card>

                  {/* Access Duration Info */}
                  <Card>
                    <CardHeader className="flex gap-3">
                      <div className="text-2xl">⏱️</div>
                      <div className="flex flex-col">
                        <p className="text-lg font-semibold">
                          Access Duration Manager
                        </p>
                        <p className="text-sm text-default-500">
                          Control student access to courses
                        </p>
                      </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="gap-3">
                      <ul className="list-disc list-inside space-y-2 text-sm text-default-600">
                        <li>Search for students by user ID</li>
                        <li>View all courses a student has access to</li>
                        <li>Set initial access duration (1-month to lifetime)</li>
                        <li>Extend student access by days</li>
                        <li>Reduce student access if needed</li>
                      </ul>
                      <Button
                        as={Link}
                        href="/admin/access-duration"
                        color="success"
                        fullWidth
                      >
                        Go to Access Manager
                      </Button>
                    </CardBody>
                  </Card>
                </div>

                {/* Key Features */}
                <Card>
                  <CardHeader>
                    <p className="text-lg font-semibold">Key Features</p>
                  </CardHeader>
                  <Divider />
                  <CardBody className="gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">💰 Flexible Pricing</h4>
                        <p className="text-sm text-default-600">
                          Set original price and optional discount prices for combos
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">📅 Access Control</h4>
                        <p className="text-sm text-default-600">
                          Choose from 1-month, 2-months, 3-months, or lifetime access
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">👥 Student Management</h4>
                        <p className="text-sm text-default-600">
                          Search, view, and manage individual student access
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Best Practices */}
                <Card className="bg-warning-50 border border-warning">
                  <CardHeader>
                    <p className="text-lg font-semibold">💡 Best Practices</p>
                  </CardHeader>
                  <Divider />
                  <CardBody className="gap-2">
                    <ul className="list-disc list-inside space-y-1 text-sm text-default-700">
                      <li>
                        Regularly review expiring student accesses and offer renewals
                      </li>
                      <li>
                        Create popular course combinations as combos to increase sales
                      </li>
                      <li>
                        Use discount prices strategically to encourage bulk purchases
                      </li>
                      <li>
                        Monitor student access patterns to identify popular courses
                      </li>
                      <li>
                        Extend access for loyal students or as promotional offers
                      </li>
                    </ul>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            {/* Combo Management */}
            <Tab key="combos" title="Combo Management">
              <ComboManagement />
            </Tab>

            {/* Access Management */}
            <Tab key="access" title="Access Duration">
              <AccessDurationManager />
            </Tab>

            {/* Help */}
            <Tab key="help" title="Help & Documentation">
              <div className="py-8 space-y-6">
                <Card>
                  <CardHeader>
                    <p className="text-lg font-semibold">Getting Started</p>
                  </CardHeader>
                  <Divider />
                  <CardBody className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        Creating Your First Combo
                      </h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-default-600">
                        <li>Go to "Combo Management" tab</li>
                        <li>Click "+ Create Combo" button</li>
                        <li>Fill in combo details (name, description)</li>
                        <li>Select 1-3 courses to include</li>
                        <li>Set pricing and discount (optional)</li>
                        <li>Choose access duration</li>
                        <li>Click "Create Combo"</li>
                      </ol>
                    </div>

                    <Divider />

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        Managing Student Access
                      </h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-default-600">
                        <li>Go to "Access Duration" tab</li>
                        <li>Enter the student's user ID</li>
                        <li>View their current course access status</li>
                        <li>Use "Set Duration" to set initial access</li>
                        <li>Use "Extend Access" to add more days</li>
                        <li>Use "Reduce Access" to remove days (if needed)</li>
                      </ol>
                    </div>

                    <Divider />

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        Understanding Access Duration
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-default-600">
                        <li>
                          <span className="font-semibold">1-Month:</span> Access expires
                          after 30 days
                        </li>
                        <li>
                          <span className="font-semibold">2-Months:</span> Access expires
                          after 60 days
                        </li>
                        <li>
                          <span className="font-semibold">3-Months:</span> Access expires
                          after 90 days
                        </li>
                        <li>
                          <span className="font-semibold">Lifetime:</span> Access never
                          expires
                        </li>
                      </ul>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <p className="text-lg font-semibold">Pricing Tips</p>
                  </CardHeader>
                  <Divider />
                  <CardBody className="space-y-3 text-sm">
                    <p>
                      <span className="font-semibold">Original Price:</span> The regular
                      price of the combo bundle
                    </p>
                    <p>
                      <span className="font-semibold">Discount Price:</span> Optional
                      promotional price to encourage purchases
                    </p>
                    <p>
                      <span className="font-semibold">Savings:</span> The difference between
                      original and discount price (displayed to customers)
                    </p>
                    <p className="text-default-500">
                      Tip: Higher savings percentages (20-40%) encourage more combo purchases
                    </p>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <p className="text-lg font-semibold">Frequently Asked Questions</p>
                  </CardHeader>
                  <Divider />
                  <CardBody className="space-y-4 text-sm">
                    <div>
                      <p className="font-semibold text-foreground mb-1">
                        Can I edit a combo after creating it?
                      </p>
                      <p className="text-default-600">
                        Yes, click the edit icon (✏️) next to the combo in the table.
                      </p>
                    </div>

                    <Divider />

                    <div>
                      <p className="font-semibold text-foreground mb-1">
                        What happens if I disable a combo?
                      </p>
                      <p className="text-default-600">
                        Disabled combos won't appear in the student list, but existing
                        purchases remain valid.
                      </p>
                    </div>

                    <Divider />

                    <div>
                      <p className="font-semibold text-foreground mb-1">
                        Can students extend their own access?
                      </p>
                      <p className="text-default-600">
                        No, only admins can modify access. Students see notifications when
                        access is expiring soon.
                      </p>
                    </div>

                    <Divider />

                    <div>
                      <p className="font-semibold text-foreground mb-1">
                        How do I find a student's user ID?
                      </p>
                      <p className="text-default-600">
                        Check the admin users list or ask the student for their profile ID
                        shown in their dashboard.
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}
