import classNames from "classnames";
import { Link } from "react-router-dom";
import { useQuery, gql, TypedDocumentNode } from "@apollo/client";
// import Lottie from "react-lottie";
// import "@thorvg/lottie-player";
// import { DotLottiePlayer, Controls } from "@dotlottie/react-player";
// import "@dotlottie/react-player/dist/index.css";
import { useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import useLottieAnimations from "../../hooks/useLottieAnimations";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { Loader } from "@ui/components/Loader";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { ColorPicker } from "@ui/components/ColorPicker";
import { formatFileSize } from "@ui/utils/file.utils";

interface Results {
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    endCursor: string;
    startCursor: string;
  };
  edges: {
    cursor: string;
    node: {
      id: number;
      name: string;
      imageUrl: string;
      lottieUrl: string;
      jsonUrl: string;
      lottieFileSize: number;
      downloads: number;
      createdBy: {
        id: string;
        avatarUrl: string;
        username: string;
        firstName: string;
        lastName: string;
      };
    };
  }[];
}

interface PublicLottiesData {
  search?: Results;
  featured?: Results;
  popular?: Results;
  recent?: Results;
}

interface PublicLottiesVars {
  first: number;
  after: string;
  query: string;
  fetchSearch: boolean;
  fetchFeatured: boolean;
  fetchPopular: boolean;
  fetchRecent: boolean;
}

const FETCH_PUBLIC_LOTTIES: TypedDocumentNode<
  PublicLottiesData,
  PublicLottiesVars
> = gql`
  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    endCursor
    startCursor
  }

  fragment LottieNodeFragment on PublicAnimationEdge {
    cursor
    node {
      ...LottieDetails
    }
  }

  fragment LottieDetails on PublicAnimation {
    id
    name
    imageUrl
    lottieUrl
    jsonUrl
    lottieFileSize
    downloads
    createdBy {
      id
      avatarUrl
      username
      firstName
      lastName
    }
  }

  query fetchPublicLotties(
    $first: Int
    $after: String
    $query: String!
    $fetchSearch: Boolean!
    $fetchFeatured: Boolean!
    $fetchPopular: Boolean!
    $fetchRecent: Boolean!
  ) {
    search: searchPublicAnimations(first: $first, after: $after, query: $query)
      @include(if: $fetchSearch) {
      totalCount
      pageInfo {
        ...PageInfoFragment
      }
      edges {
        ...LottieNodeFragment
      }
    }

    featured: featuredPublicAnimations(first: $first, after: $after)
      @include(if: $fetchFeatured) {
      totalCount
      pageInfo {
        ...PageInfoFragment
      }
      edges {
        ...LottieNodeFragment
      }
    }

    popular: popularPublicAnimations(first: $first, after: $after)
      @include(if: $fetchPopular) {
      totalCount
      pageInfo {
        ...PageInfoFragment
      }
      edges {
        ...LottieNodeFragment
      }
    }

    recent: recentPublicAnimations(first: $first, after: $after)
      @include(if: $fetchRecent) {
      totalCount
      pageInfo {
        ...PageInfoFragment
      }
      edges {
        ...LottieNodeFragment
      }
    }
  }
`;

enum LottieType {
  "Featured" = "Featured",
  "Popular" = "Popular",
  "Recent" = "Recent",
}

const lottieTypeOptions = Object.values(LottieType) as LottieType[];

const ITEMS_PER_PAGE = 12;

export default function Animations() {
  const [lottieType, setLottieType] = useState(LottieType.Featured);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 400);
  const [color, setColor] = useState("#ffffffff");

  const { loading, error, data, fetchMore } = useQuery(FETCH_PUBLIC_LOTTIES, {
    // fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    variables: {
      first: ITEMS_PER_PAGE,
      after: "",
      query: debouncedSearchQuery,
      fetchSearch: Boolean(debouncedSearchQuery),
      fetchFeatured:
        lottieType === LottieType.Featured && !debouncedSearchQuery,
      fetchPopular: lottieType === LottieType.Popular && !debouncedSearchQuery,
      fetchRecent: lottieType === LottieType.Recent && !debouncedSearchQuery,
    },
  });

  const results =
    data?.search || data?.featured || data?.popular || data?.recent;

  const jsonUrls = useMemo(() => {
    const edges = results?.edges;
    if (edges && edges?.length > 0) {
      return edges.map(({ node }) => ({
        id: node.id,
        jsonUrl: node.jsonUrl,
      }));
    } else {
      return [];
    }
  }, [results?.edges]);

  const animationData = useLottieAnimations(jsonUrls);

  if (error) return <p>Error : {error.message}</p>;

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleLottieTypeChange = (type: LottieType) => {
    setLottieType(type);
    // Add logic to fetch data based on the selected type
  };

  const handleNextPage = () => {
    fetchMore({
      variables: {
        first: ITEMS_PER_PAGE,
        after: results?.pageInfo.endCursor,
        query: debouncedSearchQuery,
        fetchSearch: Boolean(debouncedSearchQuery),
        fetchFeatured: lottieType === LottieType.Featured,
        fetchPopular: lottieType === LottieType.Popular,
        fetchRecent: lottieType === LottieType.Recent,
      },
      updateQuery: (previousQueryResult, { fetchMoreResult }) => {
        // console.log({ previousQueryResult, fetchMoreResult });
        if (!fetchMoreResult) return previousQueryResult;
        return fetchMoreResult;
        // return {
        //   search: fetchMoreResult.search,
        //   featured: {
        //     ...fetchMoreResult.featured,
        //     edges: [
        //       ...(previousQueryResult.featured?.edges ?? []),
        //       ...(fetchMoreResult.featured?.edges ?? []),
        //     ],
        //   },
        //   popular: fetchMoreResult.popular,
        //   recent: fetchMoreResult.recent,
        // };
      },
    });
  };

  const handlePreviousPage = () => {
    fetchMore({
      variables: {
        first: ITEMS_PER_PAGE,
        before: results?.pageInfo.startCursor,
        query: debouncedSearchQuery,
        fetchSearch: Boolean(debouncedSearchQuery),
        fetchFeatured: lottieType === LottieType.Featured,
        fetchPopular: lottieType === LottieType.Popular,
        fetchRecent: lottieType === LottieType.Recent,
      },
      updateQuery: (previousQueryResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) return previousQueryResult;
        return fetchMoreResult;
      },
    });
  };

  const renderAnimation = () => {
    if (loading) return <Loader />;
    if (error) return <Loader />;

    return (
      <div
        role="list"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 "
      >
        {results?.edges.map(({ cursor, node }) => (
          <div key={cursor} className="flex flex-col ">
            <Link
              to={`/discover/${node.id}`}
              className={classNames(
                "cursor-pointer  aspect-square group block rounded-lg focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 hover:shadow-lg transition-shadow",
                {
                  "bg-chequered": color === "transparent",
                }
              )}
              style={{
                backgroundColor:
                  color === "transparent" ? "transparent" : color,
              }}
            >
              {/* <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: animationData[node.id],
                  rendererSettings: {
                    // preserveAspectRatio: "xMidYMid slice",
                  },
                }}
                height={200}
                width={200}
              /> */}

              {/* <DotLottiePlayer src={node.lottieUrl} autoplay loop  > */}
              {/* {animationData[node.id] && (
                <DotLottiePlayer src={animationData[node.id]} autoplay loop>
                  {/* <Controls /> * /}
                </DotLottiePlayer>
              )} */}

              {animationData[node.id] && (
                <DotLottieReact src={node.lottieUrl} loop autoplay />
              )}

              {/* <lottie-player
              key={node.id}
              autoPlay={true}
              loop={true}
              intermission="1000"
              mode="normal"
              // src="https://lottie.host/6d7dd6e2-ab92-4e98-826a-2f8430768886/NGnHQ6brWA.json"
              src={node.jsonUrl}
              // style="width: 500px; height: 500px;"
              style={{ display: "block", width: 500, height: 500 }}
            ></lottie-player> */}
            </Link>

            <div className="flex justify-between items-center py-3 gap-3">
              <p className="pointer-events-none block truncate text-sm font-medium text-gray-900 text-ellipsis overflow-hidden">
                {node.name}
              </p>
              <p className="pointer-events-none block text-sm font-medium text-gray-500 text-nowrap">
                {formatFileSize(node.lottieFileSize)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex flex-col gap-4">
        <div>
          <label htmlFor="mobile-search" className="sr-only">
            Search
          </label>
          <div className="relative text-gray-500 focus-within:text-gray-600">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon height={20} width={20} />
            </div>
            <input
              id="mobile-search"
              className="block w-full rounded-md border-0 bg-gray-200 py-1.5 pl-10 pr-3 text-gray-500 placeholder:text-gray-400 focus:bg-gray-100 focus:text-gray-900 focus:ring-0 focus:placeholder:text-gray-500 sm:text-sm sm:leading-6"
              placeholder="Search"
              type="search"
              name="search"
              onChange={handleSearchQueryChange}
              value={searchQuery}
            />
          </div>
        </div>

        <div className="filters">
          <div className="flex space-x-4">
            <ColorPicker
              placement="bottom-right"
              color={color}
              setColor={(color) => {
                setColor(color);
              }}
            />
            {!searchQuery &&
              lottieTypeOptions.map((type) => (
                <button
                  key={type}
                  onClick={() => handleLottieTypeChange(type)}
                  className={classNames(
                    "px-4 py-2 text-sm font-semibold uppercase focus:outline-none rounded",
                    lottieType === type
                      ? "bg-teal-600 text-white hover:bg-teal-500"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  )}
                >
                  {type}
                </button>
              ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-4 flex-grow border">
        {renderAnimation()}
      </div>
      <nav
        className="flex items-center justify-between border-t py-3 px-4 sticky bottom-0 bg-white z-10"
        aria-label="Pagination"
      >
        <div className="flex flex-1 justify-between sm:justify-end">
          <button
            className={classNames(
              "relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0",
              {
                "opacity-50 cursor-not-allowed":
                  !results?.pageInfo.hasPreviousPage,
              }
            )}
            onClick={handlePreviousPage}
            disabled={!results?.pageInfo.hasPreviousPage}
          >
            Previous
          </button>
          <button
            className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
            onClick={handleNextPage}
            disabled={!results?.pageInfo.hasNextPage}
          >
            Next
          </button>
        </div>
      </nav>
    </div>
  );
}
