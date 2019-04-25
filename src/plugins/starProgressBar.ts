import { Plugin } from '../plugin';
import { STAR_TABLE } from '../data/starTable';
import { loadStructuralProfit } from '../ajax/loadStructuralProfit';

export const starProgressBar: Plugin = {
    name: "STAR PROGRESS BAR",
    urlPatterns: ["home.*"],
    action: async function () {
        const companyName = $(".companyNameBox").html();

        const spValue = await loadStructuralProfit(companyName);
        if (!spValue || spValue >= STAR_TABLE[STAR_TABLE.length - 1]) {
            return;
        }

        let spProgress = 0;
        let stars = 0;
        for (let i = 0; i < STAR_TABLE.length - 1; ++i) {
            if (spValue >= STAR_TABLE[i] && spValue < STAR_TABLE[i + 1]) {
                stars = i + 1;
                spProgress = (spValue - STAR_TABLE[i]) / (STAR_TABLE[i + 1] - STAR_TABLE[i]) * 100;
                break;
            }
        }

        $(".companyStars").append(
            "<div id='spProgress' style='display:flex;margin-top:4px;align-items:center;'><div id='spProgressBar' style='width:75px;'/><div id='spProgressText' style='margin-left:5px'/></div>"
        );
        $("#spProgressBar").progressbar({
            value: spProgress
        });
        $("#spProgressText").html(`${spProgress.toFixed(1)}%`);

        const spTooltipText = [
            `Current SP: $${spValue.toLocaleString()}`,
            `Next star: $${STAR_TABLE[stars].toLocaleString()}`
        ];
        if (stars > 0) {
            spTooltipText.unshift(`Last star: $${STAR_TABLE[stars - 1].toLocaleString()}`);
        }
        $("#spProgress")
            .attr("title", spTooltipText.join("\n"))
            .tooltip({ content: spTooltipText.join("<br/>") });

        $("#spProgressBar").attr("class", "progressbar");
        $("#spProgressBar > div").attr("class", "progressbarValue");
    }
}
