import {
    Html,
    Head,
    Preview,
    Body,
    Container,
    Text,
    Heading,
    Section,
    Button,
    Link,
} from "@react-email/components";

interface GroupInviteEmailProps {
    inviterName: string;
    groupName: string;
    inviteLink: string;
}

export default function GroupInviteEmail({
    inviterName,
    groupName,
    inviteLink,
}: GroupInviteEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>
                {inviterName} invited you to join "{groupName}"
            </Preview>
            <Body
                style={{
                    fontFamily: "Arial, sans-serif",
                    backgroundColor: "#f4f4f4",
                    padding: "40px",
                }}
            >
                <Container
                    style={{
                        backgroundColor: "#fff",
                        padding: "20px",
                        borderRadius: "6px",
                        maxWidth: "600px",
                        margin: "auto",
                    }}
                >
                    <Section>
                        <Heading
                            style={{ fontSize: "24px", marginBottom: "20px" }}
                        >
                            You're invited to join <strong>{groupName}</strong>
                        </Heading>
                        <Text style={{ fontSize: "16px", lineHeight: "1.5" }}>
                            Hi there,
                            <br />
                            <br />
                            <strong>{inviterName}</strong> has invited you to
                            join the group <strong>{groupName}</strong>.
                        </Text>
                        <Section
                            style={{ textAlign: "center", margin: "30px 0" }}
                        >
                            <Button
                                href={inviteLink}
                                style={{
                                    backgroundColor: "#0070f3",
                                    color: "#ffffff",
                                    padding: "12px 24px",
                                    borderRadius: "5px",
                                    textDecoration: "none",
                                    fontWeight: "bold",
                                }}
                            >
                                Join Group
                            </Button>
                        </Section>
                        <Text style={{ fontSize: "14px", color: "#666" }}>
                            Or paste this link into your browser:{" "}
                            <Link
                                href={inviteLink}
                                style={{ color: "#0070f3" }}
                            >
                                {inviteLink}
                            </Link>
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}
