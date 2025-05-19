import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { TooltipProps } from "@mui/material";
import React from "react";

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip
        {...props}
        classes={{ popper: className }}
        placement="right-start"
        slotProps={{
            popper: {
                modifiers: [
                    {
                        name: "offset",
                        options: {
                            offset: [-0, -10],
                        },
                    },
                ],
            },
        }}
    />
))(() => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: "#333", // Dark background
        color: "#fff", // White text
        fontSize: "12px",
        padding: "10px",
        borderRadius: "8px",
        maxWidth: 200,
    },
}));

type CustomTooltipProps = {
    title: string;
    children: React.ReactElement;
};

const CustomTooltip = ({ title, children }: CustomTooltipProps) => {
    return <StyledTooltip title={title}>{children}</StyledTooltip>;
};

export default CustomTooltip;
