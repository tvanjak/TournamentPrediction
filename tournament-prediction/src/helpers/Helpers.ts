import theme from "@/app/styles/theme";
import { ResultEnum } from "@/types/enums";
import { Team } from "@/types/types";

export const getTeamName = (team: Team | string | undefined) => {
    if (!team) return "TBD";
    if (typeof team === "string") return team;
    return team.countries?.name ?? "TBD";
}


export const getBackgroundColor = (
    result: ResultEnum | undefined,
    team: number
): string => {
    if (team == 0) {
        switch (result) {
            case ResultEnum.HomeWin:
                return theme.palette.green.main;
            case ResultEnum.Draw:
                return theme.palette.lightgray.main;
            case ResultEnum.AwayWin:
                return theme.palette.red.main;
            default:
                return "transparent";
        }
    } else {
        switch (result) {
            case ResultEnum.HomeWin:
                return theme.palette.red.main;
            case ResultEnum.Draw:
                return theme.palette.lightgray.main;
            case ResultEnum.AwayWin:
                return theme.palette.green.main;
            default:
                return "transparent";
        }
    }
}


export const mapResult = (result: ResultEnum | undefined) => {
    switch (result) {
        case ResultEnum.HomeWin:
            return "Home Win";
        case ResultEnum.Draw:
            return "Draw";
        case ResultEnum.AwayWin:
            return "Away Win";
        default:
            return null;
    }
}